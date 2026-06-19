package controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dao.UserDAO;
import model.User;
import util.JWTUtil;
import util.PasswordUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Map;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {

    private UserDAO userDAO = new UserDAO();
    private ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        String path = req.getRequestURI();

        try {
            if (path.endsWith("/login")) {
                handleLogin(req, resp, out);
            } else if (path.endsWith("/register")) {
                handleRegister(req, resp, out);
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"message\":\"Endpoint not found\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"message\":\"Internal Server Error\"}");
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws Exception {
        Map<String, String> body = objectMapper.readValue(req.getInputStream(), Map.class);
        String email = body.get("email");
        String password = body.get("password");

        User user = userDAO.findByEmail(email);
        if (user == null || !PasswordUtil.verifyPassword(password, user.getPassword())) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"message\":\"Invalid email or password\"}");
            return;
        }

        String token = JWTUtil.generateToken(user.getUserId(), user.getRole());
        out.write("{\"token\":\"" + token + "\", \"role\":\"" + user.getRole() + "\"}");
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp, PrintWriter out) throws Exception {
        Map<String, String> body = objectMapper.readValue(req.getInputStream(), Map.class);
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        String role = body.get("role");

        if (userDAO.emailExists(email)) {
            resp.setStatus(HttpServletResponse.SC_CONFLICT);
            out.write("{\"message\":\"Email already exists\"}");
            return;
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(PasswordUtil.hashPassword(password));
        user.setRole(role != null ? role : "STUDENT");

        if (userDAO.save(user)) {
            out.write("{\"message\":\"User registered successfully\"}");
        } else {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"message\":\"Registration failed\"}");
        }
    }
}
