package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.dto.ScreenDto;
import com.Vishal.BookMyShow.dto.TheaterDto;
import com.Vishal.BookMyShow.exception.ResourceNotFoundException;
import com.Vishal.BookMyShow.model.Screen;
import com.Vishal.BookMyShow.model.Theater;
import com.Vishal.BookMyShow.repository.ScreenRepository;
import com.Vishal.BookMyShow.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ScreenService {

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    public ScreenDto createScreen(ScreenDto screenDto) {
        Theater theater = theaterRepository.findById(
                screenDto.getTheater().getId()
        ).orElseThrow(() ->
                new ResourceNotFoundException("Theater not found")
        );

        Screen screen = new Screen();
        screen.setName(screenDto.getName());
        screen.setTotalSeats(screenDto.getTotalSeats());
        screen.setTheater(theater);

        Screen savedScreen = screenRepository.save(screen);
        return mapToDto(savedScreen);
    }

    public ScreenDto getScreenById(Long id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Screen not found")
                );
        return mapToDto(screen);
    }

    private ScreenDto mapToDto(Screen screen) {
        ScreenDto dto = new ScreenDto();
        dto.setId(screen.getId());
        dto.setName(screen.getName());
        dto.setTotalSeats(screen.getTotalSeats());

        TheaterDto theaterDto = new TheaterDto();
        theaterDto.setId(screen.getTheater().getId());
        theaterDto.setName(screen.getTheater().getName());
        theaterDto.setCity(screen.getTheater().getCity());
        theaterDto.setAddress(screen.getTheater().getAddress());
        theaterDto.setTotalScreens(screen.getTheater().getTotalScreens());

        dto.setTheater(theaterDto);
        return dto;
    }
}
