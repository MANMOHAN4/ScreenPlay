package com.screenplay.util;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.function.Function;

import com.screenplay.dto.response.PageResponse;

public class PaginationUtils {

    // Private constructor to prevent instantiation
    private PaginationUtils() {
    }

    // Create pageable with sorting (DESC by default)
    public static Pageable createPageRequest(int page, int size, String sortBy) {
        return PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, sortBy));
    }

    // Create pageable without sorting
    public static Pageable createPageRequest(int page, int size) {
        return PageRequest.of(page, size);
    }

    // Convert Page<T> to PageResponse<R> using mapper
    public static <T, R> PageResponse<R> toPageResponse(Page<T> page, Function<T, R> mapper) {

        List<R> content = page.getContent()
                .stream()
                .map(mapper)
                .toList();

        return new PageResponse<>(
                content,
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize());
    }

    // Convert Page<?> with already mapped content
    public static <R> PageResponse<R> toPageResponse(Page<?> page, List<R> mappedContent) {
        return new PageResponse<>(
                mappedContent,
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize());
    }
}
