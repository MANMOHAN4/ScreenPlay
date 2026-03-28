package com.screenplay.dao;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.screenplay.entity.User;
import com.screenplay.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByVerificationToken(String verificationToken);

    Optional<User> findByPasswordResetToken(String passwordResetToken);

    long countByRoleAndActive(Role role, boolean active);

}
