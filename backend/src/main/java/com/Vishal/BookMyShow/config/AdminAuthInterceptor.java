package com.Vishal.BookMyShow.config;

import com.Vishal.BookMyShow.model.enums.UserRole;
import com.Vishal.BookMyShow.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader == null || userIdHeader.isBlank()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"message\":\"Admin authentication required\"}");
            return false;
        }

        try {
            Long userId = Long.parseLong(userIdHeader);
            boolean isAdmin = userRepository.findById(userId)
                    .map(user -> user.getRole() == UserRole.ADMIN)
                    .orElse(false);

            if (!isAdmin) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("{\"message\":\"Access denied. ADMIN role required.\"}");
                return false;
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("{\"message\":\"Invalid user id\"}");
            return false;
        }

        return true;
    }
}
