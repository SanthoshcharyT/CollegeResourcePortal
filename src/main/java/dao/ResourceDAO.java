package dao;

import model.Resource;
import util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class ResourceDAO {

    public boolean save(Resource resource) {
        String sql = "INSERT INTO resources (title, description, subject, semester, branch, resource_type, file_path, status, uploaded_by) "
                +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = DBUtil.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, resource.getTitle());
            ps.setString(2, resource.getDescription());
            ps.setString(3, resource.getSubject());
            ps.setInt(4, resource.getSemester());
            ps.setString(5, resource.getBranch());
            ps.setString(6, resource.getResourceType());
            ps.setString(7, resource.getFilePath());
            ps.setString(8, "PENDING"); // Default status
            ps.setInt(9, resource.getUploadedBy());

            return ps.executeUpdate() == 1;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Resource> findAllApproved(String branch, String semester, String subject, String type, int offset,
            int limit) {
        StringBuilder sql = new StringBuilder("SELECT r.*, u.name as uploader_name, u.email as uploader_email " +
                "FROM resources r JOIN users u ON r.uploaded_by = u.user_id " +
                "WHERE r.status = 'APPROVED'");
        List<Object> params = new ArrayList<>();

        if (branch != null && !branch.isEmpty()) {
            sql.append(" AND r.branch = ?");
            params.add(branch);
        }
        if (semester != null && !semester.isEmpty()) {
            sql.append(" AND r.semester = ?");
            params.add(Integer.parseInt(semester));
        }
        if (subject != null && !subject.isEmpty()) {
            sql.append(" AND r.subject LIKE ?");
            params.add("%" + subject + "%");
        }
        if (type != null && !type.isEmpty()) {
            sql.append(" AND r.resource_type = ?");
            params.add(type);
        }

        sql.append(" ORDER BY r.upload_date DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        List<Resource> list = new ArrayList<>();
        try (Connection con = DBUtil.getConnection();
                PreparedStatement ps = con.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToResource(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Resource> findPending() {
        String sql = "SELECT r.*, u.name as uploader_name, u.email as uploader_email " +
                "FROM resources r JOIN users u ON r.uploaded_by = u.user_id " +
                "WHERE r.status = 'PENDING' ORDER BY r.upload_date ASC";
        List<Resource> list = new ArrayList<>();
        try (Connection con = DBUtil.getConnection();
                PreparedStatement ps = con.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSetToResource(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    public boolean updateStatus(int resourceId, String status) {
        String sql = "UPDATE resources SET status = ? WHERE resource_id = ?";
        try (Connection con = DBUtil.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, status);
            ps.setInt(2, resourceId);

            return ps.executeUpdate() == 1;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public Resource findById(int resourceId) {
        String sql = "SELECT r.*, u.name as uploader_name, u.email as uploader_email " +
                "FROM resources r JOIN users u ON r.uploaded_by = u.user_id " +
                "WHERE r.resource_id = ?";
        try (Connection con = DBUtil.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, resourceId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapResultSetToResource(rs);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Resource> findByUploadedBy(int userId) {
        String sql = "SELECT r.*, u.name as uploader_name, u.email as uploader_email " +
                "FROM resources r JOIN users u ON r.uploaded_by = u.user_id " +
                "WHERE r.uploaded_by = ? ORDER BY r.upload_date DESC";
        List<Resource> list = new ArrayList<>();
        try (Connection con = DBUtil.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(mapResultSetToResource(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    private Resource mapResultSetToResource(ResultSet rs) throws Exception {
        Resource r = new Resource();
        r.setResourceId(rs.getInt("resource_id"));
        r.setTitle(rs.getString("title"));
        r.setDescription(rs.getString("description"));
        r.setSubject(rs.getString("subject"));
        r.setSemester(rs.getInt("semester"));
        r.setBranch(rs.getString("branch"));
        r.setResourceType(rs.getString("resource_type"));
        r.setFilePath(rs.getString("file_path"));
        r.setStatus(rs.getString("status"));
        r.setUploadedBy(rs.getInt("uploaded_by"));
        r.setUploadDate(rs.getTimestamp("upload_date"));

        // Handle joined columns if present
        try {
            r.setUploaderName(rs.getString("uploader_name"));
            r.setUploaderEmail(rs.getString("uploader_email"));
        } catch (java.sql.SQLException e) {
            // Columns might not exist if query didn't join (e.g. basic find)
            // but we updated all main queries to join.
        }

        return r;
    }
}
