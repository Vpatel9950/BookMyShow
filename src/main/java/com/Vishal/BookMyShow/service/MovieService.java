package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.dto.MovieDto;
import com.Vishal.BookMyShow.exception.ResourceNotFoundException;
import com.Vishal.BookMyShow.model.Movie;
import com.Vishal.BookMyShow.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public MovieDto createMovie(MovieDto movieDto){
        Movie movie=mapToEntity(movieDto);
        Movie saveMovie=movieRepository.save(movie);
        return mapToMovieDto(saveMovie);
    }

    public MovieDto getMovieById(Long id){
        Movie movie=movieRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Movie Not found with Id: "+id));
        return mapToMovieDto(movie);
    }

    public List<MovieDto> getAllMovies(){
        List<Movie> movies=movieRepository.findAll();
        return movies.stream()
                .map(this::mapToMovieDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> getMovieByLanguage(String language){
        List<Movie>movies=movieRepository.findByLanguage(language);
        return movies.stream()
                .map(this::mapToMovieDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> getMovieByGenre(String genre){
        List<Movie>movies=movieRepository.findByGenre(genre);
        return movies.stream()
                .map(this::mapToMovieDto)
                .collect(Collectors.toList());
    }

    public List<MovieDto> searchMovies(String title){
        List<Movie>movies=movieRepository.findByTitleContaining(title);
        return movies.stream()
                .map(this::mapToMovieDto)
                .collect(Collectors.toList());
    }

    public MovieDto updateMovie(Long id, MovieDto movieDto){
        Movie movie=movieRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Movie Not found with Id: "+id));
        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());
        movie.setLanguage(movieDto.getLanguage());
        movie.setGenre(movieDto.getGenre());
        movie.setDurationMins(movieDto.getDurationMins());
        movie.setReleaseDate(movieDto.getReleaseDate());
        movie.setPosterUrl(movieDto.getPosterUrl());

        Movie updatedMovie=movieRepository.save(movie);
        return mapToMovieDto(updatedMovie);

    }

    public void deleteMovie(Long id){
       Movie movie=movieRepository.findById(id)
               .orElseThrow(()->new ResourceNotFoundException("Delete Movie form Id: "+id));
       movieRepository.delete(movie);
    }

    private MovieDto mapToMovieDto(Movie movie){
        MovieDto movieDto=new MovieDto();
        movieDto.setId(movie.getId());
        movieDto.setTitle(movie.getTitle());
        movieDto.setDescription(movie.getDescription());
        movieDto.setLanguage(movie.getLanguage());
        movieDto.setDurationMins(movie.getDurationMins());
        movieDto.setReleaseDate(movie.getReleaseDate());
        movieDto.setPosterUrl(movie.getPosterUrl());
        movieDto.setGenre(movie.getGenre());
        return movieDto;
    }

    public Movie mapToEntity(MovieDto movieDto){
        Movie movie=new Movie();
        movie.setTitle(movieDto.getTitle());
        movie.setDescription(movieDto.getDescription());
        movie.setLanguage(movieDto.getLanguage());
        movie.setGenre(movieDto.getGenre());
        movie.setDurationMins(movieDto.getDurationMins());
        movie.setReleaseDate(movieDto.getReleaseDate());
        movie.setPosterUrl(movieDto.getPosterUrl());
        return movie;
    }
}
