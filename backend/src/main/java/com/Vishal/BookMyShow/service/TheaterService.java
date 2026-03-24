package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.dto.TheaterDto;
import com.Vishal.BookMyShow.exception.ResourceNotFoundException;
import com.Vishal.BookMyShow.model.Theater;
import com.Vishal.BookMyShow.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TheaterService {

    @Autowired
    private TheaterRepository theaterRepository;

    public TheaterDto createTheater(TheaterDto theaterDto){
        Theater theater=mapToEntity(theaterDto);
        Theater savedTheater=theaterRepository.save(theater);
        return mapToDto(savedTheater);
    }

    public TheaterDto getTheaterById(Long id){
        Theater theater=theaterRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Theater Not found through this Id: "+id));
        return mapToDto(theater);
    }

    public List<TheaterDto> getAllTheaters(){
         List<Theater> theaters=theaterRepository.findAll();
         return theaters.stream()
                 .map(this::mapToDto)
                 .collect(Collectors.toList());
    }

    public List<TheaterDto> getAllTheatersByCity(String city){
        List<Theater> theaters=theaterRepository.findByCity(city);
        return theaters.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private TheaterDto mapToDto(Theater theater) {
        TheaterDto theaterDto=new TheaterDto();
        theaterDto.setId(theater.getId());
        theaterDto.setAddress(theater.getAddress());
        theaterDto.setName(theater.getName());
        theaterDto.setCity(theater.getCity());
        theaterDto.setTotalScreens(theater.getTotalScreens());
        return theaterDto;
    }

    private Theater mapToEntity(TheaterDto theaterDto) {
        Theater theater=new Theater();
        theater.setName(theaterDto.getName());
        theater.setAddress(theaterDto.getAddress());
        theater.setCity(theaterDto.getCity());
        theater.setTotalScreens(theaterDto.getTotalScreens());
        return theater;
    }
}
