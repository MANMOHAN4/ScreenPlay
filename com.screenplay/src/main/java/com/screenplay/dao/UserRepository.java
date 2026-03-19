package com.screenplay.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.screenplay.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

}
