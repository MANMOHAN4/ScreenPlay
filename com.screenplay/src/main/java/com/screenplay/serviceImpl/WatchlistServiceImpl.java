package com.screenplay.serviceImpl;

import com.screenplay.entity.User;
import com.screenplay.entity.Video;
import com.screenplay.dto.response.MessageResponse;
import com.screenplay.dto.response.PageResponse;
import com.screenplay.dto.response.VideoResponse;
import com.screenplay.dao.UserRepository;
import com.screenplay.service.WatchlistService;
import com.screenplay.util.PaginationUtils;
import com.screenplay.util.ServiceUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class WatchlistServiceImpl implements WatchlistService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceUtils serviceUtils;

    @Override
    public MessageResponse addToWatchlist(String email, Long videoId) {

        User user = serviceUtils.getUserByEmailOrThrow(email);

        Video video = serviceUtils.getVideoByIdOrThrow(videoId);

        user.addToWatchlist(video);
        userRepository.save(user);

        return new MessageResponse("Video added to watchlist successfully");
    }

    @Override
    public MessageResponse removeFromWatchlist(String email, Long videoId) {

        User user = serviceUtils.getUserByEmailOrThrow(email);

        Video video = serviceUtils.getVideoByIdOrThrow(videoId);

        user.removeFromWatchlist(video);
        userRepository.save(user);

        return new MessageResponse("Video removed from watchlist successfully");
    }

    @Override
    public PageResponse<VideoResponse> getWatchlistPaginated(String email, int page, int size, String search) {

        User user = serviceUtils.getUserByEmailOrThrow(email);

        Pageable pageable = PaginationUtils.createPageRequest(page, size);

        Page<Video> videoPage;

        if (search != null && !search.trim().isEmpty()) {
            videoPage = userRepository.searchWatchlistByUserId(
                    user.getId(),
                    search.trim(),
                    pageable);
        } else {
            videoPage = userRepository.findWatchlistByUserId(
                    user.getId(),
                    pageable);
        }

        return PaginationUtils.toPageResponse(
                videoPage,
                VideoResponse::fromEntity);
    }
}
