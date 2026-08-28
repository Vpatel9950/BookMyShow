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

    @Autowired private UserRepository userRepository;
    @Autowired private ShowRepository showRepository;
    @Autowired private ShowSeatRepository showSeatRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private EmailService emailService;

    @Transactional
    public BookingDto createBooking(BookingRequestDto bookingRequest) {

        User user = userRepository.findById(bookingRequest.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User Not Found"));

        Show show = showRepository.findById(bookingRequest.getShowId())
                .orElseThrow(() -> new ResourceNotFoundException("Show Not Found"));

        List<ShowSeat> selectedSeats =
                showSeatRepository.findAllById(bookingRequest.getSeatIds());

        if (selectedSeats.isEmpty()) {
            throw new RuntimeException("No seats selected");
        }

        for (ShowSeat seat : selectedSeats) {
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                throw new SeatUnavailableException(
                        "Seat " + seat.getSeat().getSeatNumber() + " is not available"
                );
            }
            seat.setStatus(SeatStatus.LOCKED);
        }
        showSeatRepository.saveAll(selectedSeats);

        Double totalAmount = selectedSeats.stream()
                .mapToDouble(ShowSeat::getPrice)
                .sum();

        Payment payment = new Payment();
        payment.setAmount(totalAmount);
        payment.setPaymentTime(LocalDateTime.now());
        payment.setPaymentMethod(bookingRequest.getPaymentMethod());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setTransactionId(UUID.randomUUID().toString());

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setShow(show);
        booking.setBookingTime(LocalDateTime.now());
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalAmount(totalAmount);
        booking.setBookingNumber(UUID.randomUUID().toString());
        booking.setPayment(payment);
        booking.setLockedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        selectedSeats.forEach(seat -> seat.setBooking(savedBooking));
        showSeatRepository.saveAll(selectedSeats);

        return mapToBookingDto(savedBooking, selectedSeats);
    }

    @Transactional
    public BookingDto confirmBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking Not Found"));

        List<ShowSeat> seats = showSeatRepository.findByBookingId(bookingId);

        seats.forEach(seat -> seat.setStatus(SeatStatus.BOOKED));

        booking.setStatus(BookingStatus.CONFIRMED);

        if (booking.getPayment() != null) {
            booking.getPayment().setStatus(PaymentStatus.SUCCESS);
        }

        bookingRepository.save(booking);
        showSeatRepository.saveAll(seats);

        // 📩 Send booking confirmation email
        try {
            emailService.sendBookingConfirmationEmail(booking, seats);
        } catch (Exception e) {
            System.err.println("⚠️ Could not send email confirmation: " + e.getMessage());
        }

        return mapToBookingDto(booking, seats);
    }

    public BookingDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking Not Found"));

        List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());
        return mapToBookingDto(booking, seats);
    }

    public BookingDto getBookingByNumber(String bookingNumber) {
        Booking booking = bookingRepository.findByBookingNumber(bookingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking Not Found"));

        List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());
        return mapToBookingDto(booking, seats);
    }

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

    public List<BookingDto> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(booking -> {
                    List<ShowSeat> seats = showSeatRepository.findByBookingId(booking.getId());
                    return mapToBookingDto(booking, seats);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingDto cancelBooking(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking Not Found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking already cancelled");
        }

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

    private BookingDto mapToBookingDto(Booking booking, List<ShowSeat> seats) {
        BookingDto bookingDto = new BookingDto();
        bookingDto.setId(booking.getId());
        bookingDto.setBookingNumber(booking.getBookingNumber());
        bookingDto.setBookingTime(booking.getBookingTime());
        bookingDto.setStatus(String.valueOf(booking.getStatus()));
        bookingDto.setTotalAmount(booking.getTotalAmount());

        if (booking.getUser() != null) {
            UserDto userDto = new UserDto();
            userDto.setId(booking.getUser().getId());
            userDto.setName(booking.getUser().getName());
            userDto.setEmail(booking.getUser().getEmail());
            userDto.setPhoneNumber(booking.getUser().getPhoneNumber());
            bookingDto.setUser(userDto);
        }

        if (booking.getShow() != null) {
            Show show = booking.getShow();
            ShowDto showDto = new ShowDto();
            showDto.setId(show.getId());
            showDto.setStartTime(show.getStartTime());
            showDto.setEndTime(show.getEndTime());

            Movie movie = show.getMovie();
            if (movie != null) {
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
            }

            Screen screen = show.getScreen();
            if (screen != null) {
                TheaterDto theaterDto = new TheaterDto(
                        screen.getTheater().getId(),
                        screen.getTheater().getName(),
                        screen.getTheater().getAddress(),
                        screen.getTheater().getCity(),
                        screen.getTheater().getTotalScreens()
                );
                showDto.setScreen(new ScreenDto(
                        screen.getId(),
                        screen.getName(),
                        screen.getTotalSeats(),
                        theaterDto
                ));
            }
            bookingDto.setShow(showDto);
        }

        if (seats != null) {
            bookingDto.setSeats(seats.stream().map(seat -> {
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
            }).collect(Collectors.toList()));
        }

        if (booking.getPayment() != null) {
            Payment payment = booking.getPayment();
            PaymentDto paymentDto = new PaymentDto();
            paymentDto.setId(payment.getId());
            paymentDto.setTransactionId(payment.getTransactionId());
            paymentDto.setAmount(payment.getAmount());
            paymentDto.setPaymentTime(payment.getPaymentTime());
            paymentDto.setPaymentMethod(payment.getPaymentMethod());
            paymentDto.setStatus(String.valueOf(payment.getStatus()));
            bookingDto.setPayment(paymentDto);
        }

        return bookingDto;
    }
}
