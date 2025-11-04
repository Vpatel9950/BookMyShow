package com.Vishal.BookMyShow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShowSeatDto {
    private Long id;
    private SeatDto seat;
    private String Status;
    private Double price;

}
