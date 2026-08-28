package com.Vishal.BookMyShow.repository;

import com.Vishal.BookMyShow.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByScreen_Id(Long screenId);
}
