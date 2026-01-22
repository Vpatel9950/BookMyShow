package com.Vishal.BookMyShow.controller;

import com.Vishal.BookMyShow.dto.BookingDto;
import com.Vishal.BookMyShow.dto.BookingRequestDto;
import com.Vishal.BookMyShow.dto.MovieDto;
import com.Vishal.BookMyShow.service.MovieService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MoviesController {

    @Autowired
    private MovieService movieService;

    @PostMapping
    public ResponseEntity<MovieDto> createMovie(@RequestBody MovieDto movieDto) {
        return new ResponseEntity<>(
                movieService.createMovie(movieDto),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieDto> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    @GetMapping
    public ResponseEntity<List<MovieDto>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @GetMapping("/search")
    public ResponseEntity<List<MovieDto>> searchMovies(
            @RequestParam String title) {
        return ResponseEntity.ok(movieService.searchMovies(title));
    }

    @GetMapping("/language/{language}")
    public ResponseEntity<List<MovieDto>> getByLanguage(
            @PathVariable String language) {
        return ResponseEntity.ok(movieService.getMovieByLanguage(language));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<MovieDto>> getByGenre(
            @PathVariable String genre) {
        return ResponseEntity.ok(movieService.getMovieByGenre(genre));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MovieDto> updateMovie(
            @PathVariable Long id,
            @RequestBody MovieDto movieDto) {
        return ResponseEntity.ok(
                movieService.updateMovie(id, movieDto)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok("Movie deleted successfully");
    }
}
