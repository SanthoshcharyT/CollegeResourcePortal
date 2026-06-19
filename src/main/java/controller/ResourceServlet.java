package controller;

import dao.ResourceDAO;
import model.Resource;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@WebServlet(urlPatterns = { "/api/resources", "/api/resources/upload" })
@MultipartConfig(fileSizeThreshold = 1024 * 1024 * 2, // 2MB
        maxFileSize = 1024 * 1024 * 10, // 10MB
        maxRequestSize = 1024 * 1024 * 50 // 50MB
)
public class ResourceServlet extends HttpServlet {

    private ResourceDAO resourceDAO = new ResourceDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    // Constant for upload directory (Modify as needed for server env)
    private static final String UPLOAD_DIR = "uploads";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        PrintWriter out = resp.getWriter();

        try {
            // Check if user wants their own uploads
            String myUploads = req.getParameter("my");
            if ("true".equals(myUploads)) {
                // Auth check required
                Integer userId = (Integer) req.getAttribute("userId");
                if (userId == null) {
                    resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    out.write("{\"message\":\"Authentication required\"}");
                    return;
                }

                List<Resource> myResources = resourceDAO.findByUploadedBy(userId);
                // Mask filePath
                for (Resource r : myResources)
                    r.setFilePath(null);

                out.write(objectMapper.writeValueAsString(myResources));
                return;
            }

            // Public / Filtered List
            String branch = req.getParameter("branch");
            String semester = req.getParameter("semester");
            String subject = req.getParameter("subject");
            String type = req.getParameter("resourceType");
            int page = req.getParameter("page") != null ? Integer.parseInt(req.getParameter("page")) : 1;
            int limit = 100; // Increased limit for now
            int offset = (page - 1) * limit;

            List<Resource> resources = resourceDAO.findAllApproved(branch, semester, subject, type, offset, limit);

            // Mask filePath for security
            for (Resource r : resources) {
                r.setFilePath(null);
            }

            out.write(objectMapper.writeValueAsString(resources));
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"message\":\"Error fetching resources\"}");
            e.printStackTrace();
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getRequestURI();
        if (path.endsWith("/upload")) {
            handleUpload(req, resp);
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    private void handleUpload(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        try {
            // 1. Authorization Check (Already done by JWTFilter, but double check role if
            // needed)
            // Ideally only STUDENTs upload, but Requirements say role: STUDENT only.
            String role = (String) req.getAttribute("role");
            if (role == null || !"STUDENT".equals(role)) {
                resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                out.write("{\"message\":\"Only students can upload resources\"}");
                return;
            }

            int userId = (int) req.getAttribute("userId");

            // 2. Extract Parts
            Part filePart = req.getPart("file");
            if (filePart == null || filePart.getSize() == 0) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"message\":\"File is missing\"}");
                return;
            }

            // 3. Validate File Type (PDF only)
            String fileName = Paths.get(filePart.getSubmittedFileName()).getFileName().toString();
            if (!fileName.toLowerCase().endsWith(".pdf")) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"message\":\"Only PDF files are allowed\"}");
                return;
            }

            // 4. Extract Metadata
            String branch = req.getParameter("branch");
            String semester = req.getParameter("semester");
            String subject = req.getParameter("subject");
            String resourceType = req.getParameter("resourceType");
            String description = req.getParameter("description");

            if (branch == null || semester == null || subject == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"message\":\"Missing metadata (branch, semester, subject)\"}");
                return;
            }

            // 5. Save File
            // Structure: /uploads/{branch}/{semester}/{subject}/
            // We need a real path on the server.
            String applicationPath = req.getServletContext().getRealPath("");
            String uploadFilePath = applicationPath + File.separator + UPLOAD_DIR + File.separator +
                    branch + File.separator + semester + File.separator + subject;

            File uploadDir = new File(uploadFilePath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Avoid name collisions
            String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
            String fullSavePath = uploadFilePath + File.separator + uniqueFileName;

            filePart.write(fullSavePath);

            // 6. Save to DB
            Resource resource = new Resource();
            resource.setUploadedBy(userId); // Renamed from setUserId
            resource.setBranch(branch);
            resource.setSemester(Integer.parseInt(semester)); // Changed to int
            resource.setSubject(subject);
            resource.setResourceType(resourceType != null ? resourceType.toUpperCase() : "NOTES"); // Ensure ENUM case
            resource.setTitle(fileName); // Use filename as title for now
            resource.setFilePath(fullSavePath); // Physical path
            resource.setFileName(fileName); // Transient for object, mostly for display logic
            resource.setDescription(description);

            boolean success = resourceDAO.save(resource);

            if (success) {
                resp.setStatus(HttpServletResponse.SC_CREATED);
                out.write("{\"message\":\"Resource uploaded successfully. Pending approval.\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"message\":\"Database error\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"message\":\"Upload failed: " + e.getMessage() + "\"}");
        }
    }
}
