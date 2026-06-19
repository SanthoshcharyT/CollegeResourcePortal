package controller;

import dao.DownloadDAO;
import dao.ResourceDAO;
import model.Resource;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;

@WebServlet("/api/resources/download")
public class DownloadServlet extends HttpServlet {

    private ResourceDAO resourceDAO = new ResourceDAO();
    private DownloadDAO downloadDAO = new DownloadDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            String idParam = req.getParameter("resourceId");
            if (idParam == null) {
                resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Missing resourceId");
                return;
            }

            int resourceId = Integer.parseInt(idParam);
            int userId = (int) req.getAttribute("userId");

            // 1. Get Resource
            Resource resource = resourceDAO.findById(resourceId);

            // Allow download if APPROVED OR if user is ADMIN (to verify pending files)
            // Ideally we check role from request attribute
            String role = (String) req.getAttribute("role");
            boolean isAdmin = "ADMIN".equals(role);

            if (resource == null) {
                resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Resource not found");
                return;
            }

            if (!"APPROVED".equals(resource.getStatus()) && !isAdmin) {
                resp.sendError(HttpServletResponse.SC_FORBIDDEN, "Resource not yet approved");
                return;
            }

            // 2. Track Download (Unique)
            if (!downloadDAO.hasUserDownloaded(userId, resourceId)) {
                downloadDAO.recordDownload(userId, resourceId);
            }

            // 3. Serve File
            File file = new File(resource.getFilePath());
            if (!file.exists()) {
                resp.sendError(HttpServletResponse.SC_NOT_FOUND, "File not found on server");
                return;
            }

            resp.setContentType("application/pdf");
            resp.setHeader("Content-Disposition", "inline; filename=\"" + resource.getFileName() + "\"");
            resp.setContentLength((int) file.length());

            try (FileInputStream in = new FileInputStream(file);
                    OutputStream out = resp.getOutputStream()) {

                byte[] buffer = new byte[4096];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            resp.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Download failed");
        }
    }
}
