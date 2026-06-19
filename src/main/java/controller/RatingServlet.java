package controller;

import dao.RatingDAO;
import model.Rating;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@WebServlet("/api/resources/rate")
public class RatingServlet extends HttpServlet {

    private RatingDAO ratingDAO = new RatingDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();

        try {
            int userId = (int) req.getAttribute("userId");

            Map<String, Object> body = objectMapper.readValue(req.getInputStream(), Map.class);

            if (!body.containsKey("resourceId") || !body.containsKey("rating")) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"message\":\"Missing resourceId or rating\"}");
                return;
            }

            int resourceId = (int) body.get("resourceId");
            int starRating = (int) body.get("rating");
            String comment = (String) body.get("comment");

            if (starRating < 1 || starRating > 5) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"message\":\"Rating must be 1-5\"}");
                return;
            }

            Rating rating = new Rating();
            rating.setUserId(userId);
            rating.setResourceId(resourceId);
            rating.setRating(starRating);
            rating.setComment(comment);

            if (ratingDAO.addRating(rating)) {
                out.write("{\"message\":\"Rating submitted successfully\"}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"message\":\"Failed to save rating\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"message\":\"Error processing request\"}");
        }
    }
}
