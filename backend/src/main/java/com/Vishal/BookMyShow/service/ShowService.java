package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.dto.*;
import com.Vishal.BookMyShow.exception.ResourceNotFoundException;
import com.Vishal.BookMyShow.model.Movie;
import com.Vishal.BookMyShow.model.Screen;
import com.Vishal.BookMyShow.model.Seat;
import com.Vishal.BookMyShow.model.Show;
import com.Vishal.BookMyShow.model.ShowSeat;
import com.Vishal.BookMyShow.model.enums.SeatStatus;
import com.Vishal.BookMyShow.repository.MovieRepository;
import com.Vishal.BookMyShow.repository.ScreenRepository;
import com.Vishal.BookMyShow.repository.SeatRepository;
import com.Vishal.BookMyShow.repository.ShowRepository;
import com.Vishal.BookMyShow.repository.ShowSeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShowService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Transactional
    public ShowDto createShow(ShowDto showDto){
        Show show=new Show();
        Movie movie=movieRepository.findById(showDto.getMovie().getId())
                .orElseThrow(()->new ResourceNotFoundException("Movie Not Found"));

        Screen screen=screenRepository.findById(showDto.getScreen().getId())
                .orElseThrow(()->new ResourceNotFoundException("Screen Not Found"));

        show.setMovie(movie);
        show.setScreen(screen);
        show.setStartTime(showDto.getStartTime());
        show.setEndTime(showDto.getEndTime());
        show.setLanguage(showDto.getLanguage() != null ? showDto.getLanguage() : movie.getLanguage());
        show.setFormat(showDto.getFormat() != null ? showDto.getFormat() : "2D");
        show.setTicketPrice(showDto.getTicketPrice() != null ? showDto.getTicketPrice() : 250.0);

        Show savedShow=showRepository.save(show);
        createShowSeats(savedShow, screen, savedShow.getTicketPrice());

        List<ShowSeat> allSeats = showSeatRepository.findByShowId(savedShow.getId());
        return mapToDto(savedShow, allSeats);
    }

    private void ensureScreenSeatsExist(Screen screen) {
        List<Seat> existing = seatRepository.findByScreen_Id(screen.getId());
        if (existing.isEmpty()) {
            int total = screen.getTotalSeats() != null && screen.getTotalSeats() > 0 ? screen.getTotalSeats() : 40;
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
    }

    private void createShowSeats(Show show, Screen screen, Double ticketPrice) {
        ensureScreenSeatsExist(screen);
        List<Seat> seats = seatRepository.findByScreen_Id(screen.getId());

        seats.forEach(seat -> {
            ShowSeat showSeat = new ShowSeat();
            showSeat.setShow(show);
            showSeat.setSeat(seat);
            showSeat.setStatus(SeatStatus.AVAILABLE);
            double price = ticketPrice != null ? ticketPrice : seat.getBasePrice();
            if ("GOLD".equalsIgnoreCase(seat.getSeatType()) || "PLATINUM".equalsIgnoreCase(seat.getSeatType())) {
                price = (ticketPrice != null ? ticketPrice : seat.getBasePrice()) * 1.5;
            }
            showSeat.setPrice(price);
            showSeat.setBooking(null);
            showSeatRepository.save(showSeat);
        });
    }

    private List<ShowSeat> getOrGenerateShowSeats(Show show) {
        List<ShowSeat> seats = showSeatRepository.findByShowId(show.getId());
        if (seats.isEmpty()) {
            createShowSeats(show, show.getScreen(), show.getTicketPrice());
            seats = showSeatRepository.findByShowId(show.getId());
        }
        return seats;
    }

    @Transactional
    public ShowDto updateShow(Long id, ShowDto showDto) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + id));

        if (showDto.getMovie() != null && showDto.getMovie().getId() != null) {
            Movie movie = movieRepository.findById(showDto.getMovie().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Movie Not Found"));
            show.setMovie(movie);
        }
        if (showDto.getScreen() != null && showDto.getScreen().getId() != null) {
            Screen screen = screenRepository.findById(showDto.getScreen().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Screen Not Found"));
            show.setScreen(screen);
        }
        if (showDto.getStartTime() != null) show.setStartTime(showDto.getStartTime());
        if (showDto.getEndTime() != null) show.setEndTime(showDto.getEndTime());
        if (showDto.getLanguage() != null) show.setLanguage(showDto.getLanguage());
        if (showDto.getFormat() != null) show.setFormat(showDto.getFormat());
        if (showDto.getTicketPrice() != null) show.setTicketPrice(showDto.getTicketPrice());

        Show saved = showRepository.save(show);
        List<ShowSeat> allSeats = getOrGenerateShowSeats(saved);
        return mapToDto(saved, allSeats);
    }

    @Transactional
    public void deleteShow(Long id) {
        Show show = showRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Show not found with id: " + id));
        showSeatRepository.findByShowId(id).forEach(showSeatRepository::delete);
        showRepository.delete(show);
    }

    @Transactional
    public ShowDto getShowById(Long id){
       Show show=showRepository.findById(id)
               .orElseThrow(()->new ResourceNotFoundException("Show not found with id: "+id));
       List<ShowSeat> allSeats = getOrGenerateShowSeats(show);
       return mapToDto(show, allSeats);
    }

    @Transactional
    public List<ShowDto> getAllShows(){
        List<Show> shows=showRepository.findAll();
        return shows.stream()
                .map(show->{
                    List<ShowSeat> seats = getOrGenerateShowSeats(show);
                    return mapToDto(show, seats);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ShowDto> getShowsByMovie(Long movieId){
        List<Show> shows=showRepository.findByMovieId(movieId);
        return shows.stream()
                .map(show->{
                    List<ShowSeat> seats = getOrGenerateShowSeats(show);
                    return mapToDto(show, seats);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ShowDto> getShowsByMovieAndCity(Long movieId,String city){
        List<Show> shows=showRepository.findByMovie_IdAndScreen_Theater_City(movieId,city);
        return shows.stream()
                .map(show->{
                    List<ShowSeat> seats = getOrGenerateShowSeats(show);
                    return mapToDto(show, seats);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ShowDto> getShowsByDateRange(LocalDateTime startDate,LocalDateTime endDate){
        List<Show> shows=showRepository.findByStartTimeBetween(startDate,endDate);
        return shows.stream()
                .map(show->{
                    List<ShowSeat> seats = getOrGenerateShowSeats(show);
                    return mapToDto(show, seats);
                })
                .collect(Collectors.toList());
    }

    private ShowDto mapToDto(Show show,List<ShowSeat> seatList){
        ShowDto showDto=new ShowDto();
        showDto.setId(show.getId());
        showDto.setStartTime(show.getStartTime());
        showDto.setEndTime(show.getEndTime());
        showDto.setLanguage(show.getLanguage());
        showDto.setFormat(show.getFormat());
        showDto.setTicketPrice(show.getTicketPrice());

        showDto.setMovie(new MovieDto(
                show.getMovie().getId(),
                show.getMovie().getTitle(),
                show.getMovie().getDescription(),
                show.getMovie().getLanguage(),
                show.getMovie().getGenre(),
                show.getMovie().getDurationMins(),
                show.getMovie().getReleaseDate(),
                show.getMovie().getPosterUrl()
        ));

        TheaterDto theaterDto=new TheaterDto(
                show.getScreen().getTheater().getId(),
                show.getScreen().getTheater().getName(),
                show.getScreen().getTheater().getAddress(),
                show.getScreen().getTheater().getCity(),
                show.getScreen().getTheater().getTotalScreens()
                );

        showDto.setScreen(new ScreenDto(
                show.getScreen().getId(),
                show.getScreen().getName(),
                show.getScreen().getTotalSeats(),
                theaterDto
        ));

        List<ShowSeatDto> seatDtos = seatList.stream()
                .map(this::mapShowSeatToDto)
                .collect(Collectors.toList());

        showDto.setSeats(seatDtos);

        List<ShowSeatDto> availableList = seatDtos.stream()
                .filter(s -> SeatStatus.AVAILABLE.name().equalsIgnoreCase(s.getStatus()))
                .collect(Collectors.toList());
        showDto.setAvailableSeats(availableList);

        return showDto;
    }

    private ShowSeatDto mapShowSeatToDto(ShowSeat seat) {
        ShowSeatDto seatDto = new ShowSeatDto();
        seatDto.setId(seat.getId());
        seatDto.setStatus(String.valueOf(seat.getStatus()));
        seatDto.setPrice(seat.getPrice());

        SeatDto baseSeatDto = new SeatDto();
        baseSeatDto.setId(seat.getSeat().getId());
        baseSeatDto.setSeatNumber(seat.getSeat().getSeatNumber());
        baseSeatDto.setSeatType(seat.getSeat().getSeatType());
        baseSeatDto.setBasePrice(seat.getSeat().getBasePrice());
        seatDto.setSeat(baseSeatDto);
        return seatDto;
    }
}
