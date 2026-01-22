package com.Vishal.BookMyShow.model;

import com.Vishal.BookMyShow.model.enums.SeatStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="Show_seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShowSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    @ManyToOne
    @JoinColumn(name="show_id",nullable = false)
    private Show show;

    @ManyToOne
    @JoinColumn(name="seat_id",nullable = false)
    private Seat seat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status;


    @Column(nullable = false)
    private Double price;

    @ManyToOne
    @JoinColumn(name="booking_id",nullable = false)
    private Booking booking;


}
