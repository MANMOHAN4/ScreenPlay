package com.screenplay.dao;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.screenplay.entity.User;
import com.screenplay.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByPasswordResetToken(String passwordResetToken);

    long countByRoleAndActive(Role role, boolean active);

    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    long countByRole(Role role);

    @Query("SELECT v.id FROM User u JOIN u.watchList v WHERE u.email = :email AND v.id IN :videoIds")
    Set<Long> findWatchlistVideoIds(@Param("email") String email, @Param("videoIds") List<Long> videoIds);

}
