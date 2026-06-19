package filter;

import util.JWTUtil;
import com.auth0.jwt.interfaces.DecodedJWT;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter("/api/*")
public class JWTFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        // CORS Headers
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        resp.setHeader("Access-Control-Allow-Credentials", "true");

        // Handle preflight requests
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            resp.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        String path = req.getRequestURI();

        // 1. Public Endpoints (No Auth Required)
        if (path.endsWith("/auth/login") || path.endsWith("/auth/register")) {
            chain.doFilter(request, response);
            return;
        }

        // Allow Public Read Access to Resources
        // Use endsWith to ignore context path (e.g.
        // /CollageResourcePortal/api/resources)
        if (path.endsWith("/api/resources") && "GET".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        // 2. Validate Token
        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"message\":\"Missing or invalid authorization header\"}");
            return;
        }

        String token = authHeader.substring(7);
        try {
            DecodedJWT jwt = JWTUtil.verifyToken(token);
            int userId = jwt.getClaim("userId").asInt();

            // 3. Verify User Exists (Handles DB Resets/User Deletion)
            dao.UserDAO userDAO = new dao.UserDAO();
            if (userDAO.findById(userId) == null) {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().write("{\"message\":\"User no longer exists\"}");
                return;
            }

            req.setAttribute("userId", userId);
            req.setAttribute("role", jwt.getClaim("role").asString());
            chain.doFilter(request, response);
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            resp.getWriter().write("{\"message\":\"Invalid token\"}");
        }
    }

    @Override
    public void destroy() {
    }
}
