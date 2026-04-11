package com.screenplay.service;

import com.screenplay.dto.request.VideoRequest;
import com.screenplay.dto.response.MessageResponse;
import com.screenplay.dto.response.PageResponse;
import com.screenplay.dto.response.VideoResponse;
import com.screenplay.dto.response.VideoStatsResponse;

import java.util.List;

public interface VideoService {

    MessageResponse createVideoByAdmin(VideoRequest videoRequest);

    PageResponse<VideoResponse> getAllAdminVideos(int page, int size, String search);

    MessageResponse updateVideoByAdmin(Long id, VideoRequest videoRequest);

    MessageResponse deleteVideoByAdmin(Long id);

    MessageResponse toggleVideoPublishStatusByAdmin(Long id, boolean value);

    VideoStatsResponse getAdminStats();

    PageResponse<VideoResponse> getPublishedVideos(int page, int size, String search, String email);

    List<VideoResponse> getFeaturedVideos();
}