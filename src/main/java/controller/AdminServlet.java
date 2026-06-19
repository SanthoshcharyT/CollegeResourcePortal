package controller;

import dao.ResourceDAO;
import model.Resource;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@WebServlet(urlPatterns = {"/api/admin/pending", "/api/admin/approve/*", "/api/admin/reject/*"})
public class AdminServlet extends HttpServlet {

    private ResourceDAO resourceDAO = new ResourceDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        processRequest(req, resp);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        processRequest(req, resp);
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        processRequest(req, resp);
    }

    private void processRequest(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        // 1. Role Check
        String role = (String) req.getAttribute("role");
        if (role == null || !"ADMIN".equals(role)) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            out.write("{\"message\":\"Access Denied. Admins only.\"}");
            return;
        }

        String path = req.getRequestURI();
        String method = req.getMethod();

        try {
            if (path.contains("/api/admin/pending") && "GET".equals(method)) {

                List<Resource> pending = resourceDAO.findPending();
                // Mask filePath
                for (Resource r : pending) {
                    r.setFilePath(null);
                }
                out.write(objectMapper.writeValueAsString(pending));

            } else if (path.contains("/api/admin/approve") && "PUT".equals(method)) {

                int resourceId = getIdFromPath(path);
                if (resourceDAO.updateStatus(resourceId, "APPROVED")) {
                    out.write("{\"message\":\"Resource approved\"}");
                } else {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"message\":\"Failed to approve\"}");
                }

            } else if (path.contains("/api/admin/reject") && "DELETE".equals(method)) {

                int resourceId = getIdFromPath(path);

                // Reason ignored as DB doesn't support it currently
                if (resourceDAO.updateStatus(resourceId, "REJECTED")) {
                    out.write("{\"message\":\"Resource rejected\"}");
                } else {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"message\":\"Failed to reject\"}");
                }

            } else {
                resp.setStatus(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"message\":\"Error processing request\"}");
        }
    }

    private int getIdFromPath(String path) {
        try {
            // /api/admin/approve/123
            String[] parts = path.split("/");
            return Integer.parseInt(parts[parts.length - 1]);
        } catch (Exception e) {
            return -1;
        }
    }
}
