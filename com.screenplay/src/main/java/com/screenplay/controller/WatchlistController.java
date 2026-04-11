package com.screenplay.controller;

import com.screenplay.dto.response.MessageResponse;
import com.screenplay.dto.response.PageResponse;
import com.screenplay.dto.response.VideoResponse;
import com.screenplay.service.WatchlistService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    // Add to Watchlist
    @PostMapping("/{videoId}")
    public ResponseEntity<MessageResponse> addToWatchlist(
            @PathVariable Long videoId,
            Authentication authentication) {
        String email = authentication.getName();

        return ResponseEntity.ok(
                watchlistService.addToWatchlist(email, videoId));
    }

    // Remove from Watchlist
    @DeleteMapping("/{videoId}")
    public ResponseEntity<MessageResponse> removeFromWatchlist(
            @PathVariable Long videoId,
            Authentication authentication) {
        String email = authentication.getName();

        return ResponseEntity.ok(
                watchlistService.removeFromWatchlist(email, videoId));
    }

    // Get All Videos in the Watchlist (Paginated + Search)
    @GetMapping
    public ResponseEntity<PageResponse<VideoResponse>> getWatchlist(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Authentication authentication) {
        String email = authentication.getName();

        PageResponse<VideoResponse> response = watchlistService.getWatchlistPaginated(email, page, size, search);

        return ResponseEntity.ok(response);
    }
}