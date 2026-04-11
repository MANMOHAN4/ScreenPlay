package com.screenplay.controller;

import com.screenplay.dto.request.VideoRequest;
import com.screenplay.service.VideoService;
import jakarta.validation.Valid;
import com.screenplay.dto.response.MessageResponse;
import com.screenplay.dto.response.PageResponse;
import com.screenplay.dto.response.VideoResponse;
import com.screenplay.dto.response.VideoStatsResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    @Autowired
    private VideoService videoService;

    // Create Video
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin")
    public ResponseEntity<MessageResponse> createVideoByAdmin(
            @Valid @RequestBody VideoRequest videoRequest) {

        return ResponseEntity.ok(videoService.createVideoByAdmin(videoRequest));
    }

    // Get All Admin Videos
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ResponseEntity<PageResponse<VideoResponse>> getAllAdminVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        return ResponseEntity.ok(videoService.getAllAdminVideos(page, size, search));
    }

    // Update Video
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}")
    public ResponseEntity<MessageResponse> updateVideoByAdmin(
            @PathVariable Long id,
            @Valid @RequestBody VideoRequest videoRequest) {

        return ResponseEntity.ok(videoService.updateVideoByAdmin(id, videoRequest));
    }

    // Delete Video
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<MessageResponse> deleteVideoByAdmin(@PathVariable Long id) {

        return ResponseEntity.ok(videoService.deleteVideoByAdmin(id));
    }

    // Toggle Publish
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/{id}/publish")
    public ResponseEntity<MessageResponse> toggleVideoPublishStatusByAdmin(
            @PathVariable Long id,
            @RequestParam boolean value) {

        return ResponseEntity.ok(
                videoService.toggleVideoPublishStatusByAdmin(id, value));
    }

    // Admin Stats
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/stats")
    public ResponseEntity<VideoStatsResponse> getAdminStats() {

        return ResponseEntity.ok(videoService.getAdminStats());
    }

    // User - Published Videos
    @GetMapping("/published")
    public ResponseEntity<PageResponse<VideoResponse>> getPublishedVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                videoService.getPublishedVideos(page, size, search, email));
    }

    // Featured Videos
    @GetMapping("/featured")
    public ResponseEntity<List<VideoResponse>> getFeaturedVideos() {

        return ResponseEntity.ok(videoService.getFeaturedVideos());
    }
}