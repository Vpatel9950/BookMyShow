package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.dto.ScreenDto;
import com.Vishal.BookMyShow.dto.TheaterDto;
import com.Vishal.BookMyShow.exception.ResourceNotFoundException;
import com.Vishal.BookMyShow.model.Screen;
import com.Vishal.BookMyShow.model.Seat;
import com.Vishal.BookMyShow.model.Theater;
import com.Vishal.BookMyShow.repository.ScreenRepository;
import com.Vishal.BookMyShow.repository.SeatRepository;
import com.Vishal.BookMyShow.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScreenService {

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private SeatRepository seatRepository;

    public List<ScreenDto> getAllScreens() {
        return screenRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ScreenDto> getScreensByTheater(Long theaterId) {
        return screenRepository.findByTheaterId(theaterId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
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
        generateDefaultSeats(savedScreen);
        return mapToDto(savedScreen);
    }

    private void generateDefaultSeats(Screen screen) {
        int total = screen.getTotalSeats() != null ? screen.getTotalSeats() : 40;
        int rows = 5;
        int seatsPerRow = Math.max(1, total / rows);
        String[] rowLetters = {"A", "B", "C", "D", "E"};
        String[] types = {"SILVER", "SILVER", "SILVER", "GOLD", "GOLD"};
        double[] prices = {250.0, 250.0, 250.0, 375.0, 375.0};

        for (int r = 0; r < rows; r++) {
            for (int n = 1; n <= seatsPerRow; n++) {
                Seat seat = new Seat();
                seat.setSeatNumber(rowLetters[r] + n);
                seat.setSeatType(types[r]);
                seat.setBasePrice(prices[r]);
                seat.setScreen(screen);
                seatRepository.save(seat);
            }
        }
    }

    public ScreenDto getScreenById(Long id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Screen not found")
                );
        return mapToDto(screen);
    }

    public ScreenDto updateScreen(Long id, ScreenDto screenDto) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Screen not found"));
        screen.setName(screenDto.getName());
        screen.setTotalSeats(screenDto.getTotalSeats());
        if (screenDto.getTheater() != null && screenDto.getTheater().getId() != null) {
            Theater theater = theaterRepository.findById(screenDto.getTheater().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Theater not found"));
            screen.setTheater(theater);
        }
        return mapToDto(screenRepository.save(screen));
    }

    public void deleteScreen(Long id) {
        Screen screen = screenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Screen not found"));
        screenRepository.delete(screen);
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
