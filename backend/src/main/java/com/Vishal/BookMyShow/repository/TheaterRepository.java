package com.Vishal.BookMyShow.repository;

import com.Vishal.BookMyShow.model.Theater;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TheaterRepository extends JpaRepository<Theater,Long> {

    List<Theater> findByCity(String city);

}
