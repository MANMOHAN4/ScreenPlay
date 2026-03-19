package com.screenplay.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.screenplay.entity.Video;

public interface VideoRepository extends JpaRepository<Video, Long> {

}
