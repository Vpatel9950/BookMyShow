package com.Vishal.BookMyShow.config;

import com.Vishal.BookMyShow.model.*;
import com.Vishal.BookMyShow.model.enums.SeatStatus;
import com.Vishal.BookMyShow.model.enums.UserRole;
import com.Vishal.BookMyShow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private MovieRepository movieRepository;
    @Autowired private TheaterRepository theaterRepository;
    @Autowired private ScreenRepository screenRepository;
    @Autowired private SeatRepository seatRepository;
    @Autowired private ShowRepository showRepository;
    @Autowired private ShowSeatRepository showSeatRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        fixBookingIdColumnNullability();
        seedUsers();

        if (movieRepository.count() == 0) {
            List<Movie> movies = seedMovies();
            Theater theater = seedTheater();
            Screen screen = seedScreen(theater);
            seedSeats(screen);
            seedShows(movies, screen);
        }

        ensureTheatersHaveScreensAndSeats();
        ensureShowsHaveSeats();
    }

    private void fixBookingIdColumnNullability() {
        try {
            jdbcTemplate.execute("ALTER TABLE show_seats MODIFY COLUMN booking_id BIGINT NULL");
        } catch (Exception e) {
            // Ignore if table does not exist yet or constraint already modified
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("demo@cineduniya.com")) {
            User demo = new User();
            demo.setName("Demo User");
            demo.setEmail("demo@cineduniya.com");
            demo.setPassword(passwordEncoder.encode("demo123"));
            demo.setPhoneNumber("9876543210");
            demo.setRole(UserRole.USER);
            userRepository.save(demo);
        }

        if (!userRepository.existsByEmail("vishal123@gmail.com")) {
            User admin = new User();
            admin.setName("Vishal Patel");
            admin.setEmail("vishal123@gmail.com");
            admin.setPassword(passwordEncoder.encode("Vishal@2024"));
            admin.setPhoneNumber("1234567890");
            admin.setRole(UserRole.ADMIN);
            userRepository.save(admin);
        } else {
            userRepository.findByEmail("vishal123@gmail.com").ifPresent(user -> {
                if (user.getRole() != UserRole.ADMIN) {
                    user.setRole(UserRole.ADMIN);
                    userRepository.save(user);
                }
            });
        }
    }

    private void ensureTheatersHaveScreensAndSeats() {
        List<Theater> theaters = theaterRepository.findAll();
        for (Theater theater : theaters) {
            List<Screen> screens = screenRepository.findByTheaterId(theater.getId());
            if (screens.isEmpty()) {
                Screen screen1 = new Screen();
                screen1.setName("Screen 1");
                screen1.setTotalSeats(40);
                screen1.setTheater(theater);
                Screen savedScreen = screenRepository.save(screen1);
                seedSeats(savedScreen);

                Screen screen2 = new Screen();
                screen2.setName("Screen 2");
                screen2.setTotalSeats(40);
                screen2.setTheater(theater);
                Screen savedScreen2 = screenRepository.save(screen2);
                seedSeats(savedScreen2);
            } else {
                for (Screen s : screens) {
                    if (seatRepository.findByScreen_Id(s.getId()).isEmpty()) {
                        seedSeats(s);
                    }
                }
            }
        }
    }

    private void ensureShowsHaveSeats() {
        List<Show> shows = showRepository.findAll();
        for (Show show : shows) {
            List<ShowSeat> showSeats = showSeatRepository.findByShowId(show.getId());
            if (showSeats.isEmpty() && show.getScreen() != null) {
                List<Seat> seats = seatRepository.findByScreen_Id(show.getScreen().getId());
                if (seats.isEmpty()) {
                    seedSeats(show.getScreen());
                    seats = seatRepository.findByScreen_Id(show.getScreen().getId());
                }
                for (Seat seat : seats) {
                    ShowSeat showSeat = new ShowSeat();
                    showSeat.setShow(show);
                    showSeat.setSeat(seat);
                    showSeat.setStatus(SeatStatus.AVAILABLE);
                    double price = show.getTicketPrice() != null ? show.getTicketPrice() : seat.getBasePrice();
                    if ("GOLD".equalsIgnoreCase(seat.getSeatType()) || "PLATINUM".equalsIgnoreCase(seat.getSeatType())) {
                        price = price * 1.5;
                    }
                    showSeat.setPrice(price);
                    showSeat.setBooking(null);
                    showSeatRepository.save(showSeat);
                }
            }
        }
    }

    private List<Movie> seedMovies() {
        List<Movie> movies = new ArrayList<>();

        movies.add(createMovie(
                "Ocean's Legacy",
                "A gripping heist thriller set on the high seas.",
                "English", "Action", 142,
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400",
                "2025-06-15"
        ));
        movies.add(createMovie(
                "Midnight Horror",
                "A terrifying tale that will keep you awake.",
                "Hindi", "Horror", 118,
                "https://images.unsplash.com/photo-1509245853830-6a022b7178a9?w=400",
                "2025-07-01"
        ));
        movies.add(createMovie(
                "Laugh Out Loud",
                "A hilarious comedy about friendship and chaos.",
                "Hindi", "Comedy", 128,
                "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
                "2025-05-20"
        ));
        movies.add(createMovie(
                "Sky Warriors",
                "Elite pilots defend the nation in an aerial battle.",
                "English", "Action", 155,
                "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400",
                "2025-08-10"
        ));

        return movieRepository.saveAll(movies);
    }

    private Movie createMovie(String title, String desc, String lang, String genre,
                              int duration, String poster, String releaseDate) {
        Movie m = new Movie();
        m.setTitle(title);
        m.setDescription(desc);
        m.setLanguage(lang);
        m.setGenre(genre);
        m.setDurationMins(duration);
        m.setPosterUrl(poster);
        m.setReleaseDate(releaseDate);
        return m;
    }

    private Theater seedTheater() {
        Theater theater = new Theater();
        theater.setName("CineDuniya Multiplex");
        theater.setAddress("123 Cinema Road, Bandra West");
        theater.setCity("Mumbai");
        theater.setTotalScreens(3);
        return theaterRepository.save(theater);
    }

    private Screen seedScreen(Theater theater) {
        Screen screen = new Screen();
        screen.setName("Audi 1");
        screen.setTotalSeats(40);
        screen.setTheater(theater);
        return screenRepository.save(screen);
    }

    private void seedSeats(Screen screen) {
        String[] rows = {"A", "B", "C", "D", "E"};
        String[] types = {"SILVER", "SILVER", "SILVER", "GOLD", "GOLD"};
        double[] prices = {250.0, 250.0, 250.0, 375.0, 375.0};

        for (int r = 0; r < rows.length; r++) {
            for (int n = 1; n <= 8; n++) {
                Seat seat = new Seat();
                seat.setSeatNumber(rows[r] + n);
                seat.setSeatType(types[r]);
                seat.setBasePrice(prices[r]);
                seat.setScreen(screen);
                seatRepository.save(seat);
            }
        }
    }

    private void seedShows(List<Movie> movies, Screen screen) {
        LocalDateTime base = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);
        int[] hours = {10, 14, 18, 21};

        for (Movie movie : movies) {
            for (int h : hours) {
                Show show = new Show();
                show.setMovie(movie);
                show.setScreen(screen);
                show.setStartTime(base.withHour(h));
                show.setEndTime(base.withHour(h).plusMinutes(movie.getDurationMins()));
                show.setTicketPrice(250.0);
                Show saved = showRepository.save(show);
                createShowSeats(saved, screen);
            }
        }
    }

    private void createShowSeats(Show show, Screen screen) {
        List<Seat> seats = seatRepository.findByScreen_Id(screen.getId());
        for (Seat seat : seats) {
            ShowSeat showSeat = new ShowSeat();
            showSeat.setShow(show);
            showSeat.setSeat(seat);
            showSeat.setStatus(SeatStatus.AVAILABLE);
            showSeat.setPrice(seat.getBasePrice());
            showSeat.setBooking(null);
            showSeatRepository.save(showSeat);
        }
    }
}
