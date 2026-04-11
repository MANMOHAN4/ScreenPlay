package com.screenplay.service;

import com.screenplay.dto.response.MessageResponse;
import com.screenplay.dto.response.PageResponse;
import com.screenplay.dto.response.VideoResponse;

public interface WatchlistService {

    MessageResponse addToWatchlist(String email, Long videoId);

    MessageResponse removeFromWatchlist(String email, Long videoId);

    PageResponse<VideoResponse> getWatchlistPaginated(String email, int page, int size, String search);
}