package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.dto.*;
import com.Vishal.BookMyShow.exception.ResourceNotFoundException;
import com.Vishal.BookMyShow.exception.SeatUnavailableException;
import com.Vishal.BookMyShow.model.*;
import com.Vishal.BookMyShow.model.enums.BookingStatus;
import com.Vishal.BookMyShow.model.enums.PaymentStatus;
import com.Vishal.BookMyShow.model.enums.SeatStatus;
import com.Vishal.BookMyShow.repository.BookingRepository;
import com.Vishal.BookMyShow.repository.ShowRepository;
import com.Vishal.BookMyShow.repository.ShowSeatRepository;
import com.Vishal.BookMyShow.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    // =========================
    // CREATE BOOKING
    // =========================
    @Transactional
    public BookingDto createBooking(BookingRequestDto bookingRequest) {

        User user = userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));

        Show show = showRepository.findById(bookingRequest.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show Not Found"));

        List<ShowSeat> selectedSeats =
                showSeatRepository.findAllById(bookingRequest.getSeatIds());

        // 1️⃣ Check availability & LOCK seats
        for (ShowSeat seat : selectedSeats) {
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new SeatUnavailableException(
                        "Seat " + seat.getSeat().getSeatNumber() + " is not available"
                );
            }
            seat.setStatus(SeatStatus.LOCKED);
        }
        showSeatRepository.saveAll(selectedSeats);

        // 2️⃣ Calculate total amount
        Double totalAmount = selectedSeats.stream()
                .mapToDouble(ShowSeat::getPrice)
                .sum();

        // 3️⃣ Create payment (INITIATED)
        Payment payment = new Payment();
        payment.setAmount(totalAmount);
        payment.setPaymentTime(LocalDateTime.now());
        payment.setPaymentMethod(bookingRequest.getPaymentMethod());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setTransactionId(UUID.randomUUID().toString());

        // 4️⃣ Create booking (PENDING)
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(totalAmount);
        booking.setBookingNumber(UUID.randomUUID().toString());
        booking.setPayment(payment);

        Booking savedBooking = bookingRepository.save(booking);

        // 5️⃣ Attach booking to seats
        selectedSeats.forEach(seat -> seat.setBooking(savedBooking));
        showSeatRepository.saveAll(selectedSeats);

        return mapToBookingDto(savedBooking, selectedSeats);
    }

    // =========================
    // GET BOOKING BY ID
    // =========================
    public BookingDto getBookingById(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking Not Found"));

        List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());

        return mapToBookingDto(booking, seats);
    }

    // =========================
    // GET BOOKING BY NUMBER
    // =========================
    public BookingDto getBookingByNumber(String bookingNumber) {

        Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking Not Found"));

        List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());

        return mapToBookingDto(booking, seats);
    }

    // =========================
    // GET BOOKINGS BY USER
    // =========================
    public List<BookingDto> getBookingByUserId(Long userId) {

        List<Booking> bookings = bookingRepository.findByUserId(userId);

        return bookings.stream()
                .map(booking -> {
                    List<ShowSeat> seats =
                            showSeatRepository.findByBookingId(booking.getId());
                    return mapToBookingDto(booking, seats);
                })
                .collect(Collectors.toList());
    }

    // =========================
    // CANCEL BOOKING
    // =========================
    @Transactional
    public BookingDto cancelBooking(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking Not Found"));

        booking.setStatus(BookingStatus.CANCELLED);

        List<ShowSeat> seats =
                showSeatRepository.findByBookingId(booking.getId());

        seats.forEach(seat -> {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setBooking(null);
        });

        if (booking.getPayment() != null) {
            booking.getPayment().setStatus(PaymentStatus.REFUNDED);
        }

        Booking updatedBooking = bookingRepository.save(booking);
        showSeatRepository.saveAll(seats);

        return mapToBookingDto(updatedBooking, seats);
    }

    // =========================
    // DTO MAPPING
    // =========================
    private BookingDto mapToBookingDto(Booking booking, List<ShowSeat> seats) {

        BookingDto bookingDto = new BookingDto();
        bookingDto.setId(booking.getId());
        bookingDto.setBookingNumber(booking.getBookingNumber());
        bookingDto.setBookingTime(booking.getBookingTime());
        bookingDto.setStatus(String.valueOf(booking.getStatus()));
        bookingDto.setTotalAmount(booking.getTotalAmount());

        // User
        UserDto userDto = new UserDto();
        userDto.setId(booking.getUser().getId());
        userDto.setName(booking.getUser().getName());
        userDto.setEmail(booking.getUser().getEmail());
        userDto.setPhoneNumber(booking.getUser().getPhoneNumber());
        bookingDto.setUser(userDto);

        // Show
        bookingDto.setShow(getShowDto(booking));

        // Seats
        List<ShowSeatDto> seatDtos = seats.stream()
                .map(seat -> {
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
                })
                .collect(Collectors.toList());

        bookingDto.setSeats(seatDtos);

        // Payment
        if (booking.getPayment() != null) {
            PaymentDto paymentDto = new PaymentDto();
            paymentDto.setId(booking.getPayment().getId());
            paymentDto.setAmount(booking.getPayment().getAmount());
            paymentDto.setPaymentMethod(booking.getPayment().getPaymentMethod());
            paymentDto.setPaymentTime(booking.getPayment().getPaymentTime());
            paymentDto.setStatus(String.valueOf(booking.getPayment().getStatus()));
            paymentDto.setTransactionId(booking.getPayment().getTransactionId());
            bookingDto.setPayment(paymentDto);
        }

        return bookingDto;
    }

    private static ShowDto getShowDto(Booking booking) {

        ShowDto showDto = new ShowDto();
        showDto.setId(booking.getShow().getId());
        showDto.setStartTime(booking.getShow().getStartTime());
        showDto.setEndTime(booking.getShow().getEndTime());

        Movie movie = booking.getShow().getMovie();
        showDto.setMovie(new MovieDto(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getLanguage(),
                movie.getGenre(),
                movie.getDurationMins(),
                movie.getReleaseDate(),
                movie.getPosterUrl()
        ));

        Screen screen = booking.getShow().getScreen();
        Theater theater = screen.getTheater();

        showDto.setScreen(new ScreenDto(
                screen.getId(),
                screen.getName(),
                screen.getTotalSeats(),
                new TheaterDto(
                        theater.getId(),
                        theater.getName(),
                        theater.getAddress(),
                        theater.getCity(),
                        theater.getTotalScreens()
                )
        ));

        return showDto;
    }
}
