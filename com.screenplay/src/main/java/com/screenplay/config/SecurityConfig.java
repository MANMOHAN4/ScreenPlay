package com.screenplay.config;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.screenplay.security.JwtAuthenticationFilter;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Value("${app.cors.allowed-origins:http://localhost:5173}")
        private String allowedOriginsRaw;

        private static final String[] PUBLIC_ENDPOINTS = {
                        "/api/auth/login",
                        "/api/auth/signup",
                        "/api/auth/validate-email",
                        "/api/auth/verify-email",
                        "/api/auth/resend-verification",
                        "/api/auth/forgot-password",
                        "/api/auth/reset-password"
        };

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        /**
         * Explicit CorsConfigurationSource wired directly into Spring Security.
         *
         * WHY THIS IS NEEDED:
         * Spring Security has its own CORS filter that runs BEFORE any servlet filters
         * (including WebMvcConfigurer / CorsConfig). When the browser sends an OPTIONS
         * preflight, Spring Security intercepts it first. If no CorsConfigurationSource
         * is wired here, it returns a 401/403 with no CORS headers — so the browser
         * blocks the actual request with "No Access-Control-Allow-Origin header".
         *
         * This bean must mirror CorsConfig.java exactly so both layers agree.
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                // Mirror CorsConfig.java exactly
                String[] origins = allowedOriginsRaw.split(",");
                config.setAllowedOrigins(Arrays.asList(origins));
                config.setAllowedMethods(Arrays.asList(
                                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "Accept",
                                "Origin",
                                "X-Requested-With",
                                "Cache-Control"));
                config.setExposedHeaders(Arrays.asList(
                                "Location", "Content-Disposition", "Authorization"));
                config.setAllowCredentials(true);
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/api/**", config);
                return source;
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())

                                // Wire the explicit CorsConfigurationSource — this is the only change
                                // from your original. replaces the empty .cors(cors -> {}) lambda.
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                .authorizeHttpRequests(auth -> auth
                                                // Let ALL OPTIONS preflight requests through without authentication.
                                                // Without this, Spring Security returns 401 on preflight before
                                                // CORS headers are added, and the browser blocks the real request.
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                                                .anyRequest().authenticated())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}