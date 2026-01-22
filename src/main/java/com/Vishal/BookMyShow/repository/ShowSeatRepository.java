package com.Vishal.BookMyShow.repository;

import com.Vishal.BookMyShow.model.ShowSeat;
import com.Vishal.BookMyShow.model.enums.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShowSeatRepository extends JpaRepository<ShowSeat,Long> {

    List<ShowSeat> findByShowId(Long movieId);

    List<ShowSeat> findByShowIdAndStatus(Long showId, SeatStatus status);


    List<ShowSeat> findByBookingId(Long id);
}
