package dao;

import model.Rating;
import util.DBUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class RatingDAO {

    public boolean addRating(Rating rating) {
        // Upsert logic: if rating exists, update it; otherwise insert
        String sql = "INSERT INTO ratings (user_id, resource_id, rating, comment) VALUES (?, ?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE rating = ?, comment = ?, rated_at = CURRENT_TIMESTAMP";

        // Note: MySQL's ON DUPLICATE KEY UPDATE assumes there is a UNIQUE constraint on
        // (user_id, resource_id).
        // If the schema (from user request description) implies "One rating per user
        // per resource", this constraint should exist.

        try (Connection con = DBUtil.getConnection();
                PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, rating.getUserId());
            ps.setInt(2, rating.getResourceId());
            ps.setInt(3, rating.getRating());
            ps.setString(4, rating.getComment());

            // For update part
            ps.setInt(5, rating.getRating());
            ps.setString(6, rating.getComment());

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
