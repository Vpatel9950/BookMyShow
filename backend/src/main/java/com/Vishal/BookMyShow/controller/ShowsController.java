package com.Vishal.BookMyShow.controller;

import com.Vishal.BookMyShow.dto.ShowDto;
import com.Vishal.BookMyShow.service.ShowService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/shows")
@CrossOrigin("*")
public class ShowsController {

    @Autowired
    private ShowService showService;

    @PostMapping
    public ResponseEntity<ShowDto> createShow(@RequestBody ShowDto showDto) {
        return new ResponseEntity<>(
                showService.createShow(showDto),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowDto> getShowById(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    @GetMapping
    public ResponseEntity<List<ShowDto>> getAllShows() {
        return ResponseEntity.ok(showService.getAllShows());
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowDto>> getShowsByMovie(
            @PathVariable Long movieId) {
        return ResponseEntity.ok(
                showService.getShowsByMovie(movieId)
        );
    }

    @GetMapping("/movie/{movieId}/city/{city}")
    public ResponseEntity<List<ShowDto>> getShowsByMovieAndCity(
            @PathVariable Long movieId,
            @PathVariable String city) {
        return ResponseEntity.ok(
                showService.getShowsByMovieAndCity(movieId, city)
        );
    }

    @GetMapping("/date")
    public ResponseEntity<List<ShowDto>> getShowsByDateRange(
            @RequestParam String start,
            @RequestParam String end) {
        return ResponseEntity.ok(
                showService.getShowsByDateRange(
                        LocalDateTime.parse(start),
                        LocalDateTime.parse(end)
                )
        );
    }
}

