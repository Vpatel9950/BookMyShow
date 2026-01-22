package com.Vishal.BookMyShow.controller;

import com.Vishal.BookMyShow.dto.ScreenDto;
import com.Vishal.BookMyShow.service.ScreenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/screens")
@CrossOrigin("*")
public class ScreenController {

    @Autowired
    private ScreenService screenService;

    @PostMapping
    public ResponseEntity<ScreenDto> createScreen(
            @RequestBody ScreenDto screenDto) {
        return new ResponseEntity<>(
                screenService.createScreen(screenDto),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenDto> getScreenById(@PathVariable Long id) {
        return ResponseEntity.ok(screenService.getScreenById(id));
    }
}

