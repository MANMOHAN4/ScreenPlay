package com.screenplay.dao;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.screenplay.entity.Video;

public interface VideoRepository extends JpaRepository<Video, Long> {

    @Query("SELECT v FROM Video v WHERE "
            + "LOWER(v.title) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(v.description) LIKE LOWER(CONCAT('%', :search, '%'))")

    Page<Video> searchVideos(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(v) FROM Video v WHERE v.published = true")
    long countPublishedVideos();

    @Query("SELECT COALESCE(SUM(v.duration), 0) FROM Video v")
    long getTotalDuration();

    @Query("SELECT v FROM Video v WHERE v.published = true AND ("
            + "LOWER(v.title) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "LOWER(v.description) LIKE LOWER(CONCAT('%', :search, '%'))) "
            + "ORDER BY v.createdAt DESC")
    Page<Video> searchPublishedVideos(@Param("search") String search, Pageable pageable);

    @Query("SELECT v FROM Video v WHERE v.published = true ORDER BY v.createdAt DESC")
    Page<Video> findPublishedVideos(Pageable pageable);

    @Query("SELECT v FROM Video v WHERE v.published = true ORDER BY FUNCTION('RAND')")
    List<Video> findRandomPublishedVideos(Pageable pageable);

}