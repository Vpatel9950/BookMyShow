package com.Vishal.BookMyShow.controller.admin;

import com.Vishal.BookMyShow.dto.ScreenDto;
import com.Vishal.BookMyShow.service.ScreenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/screens")
@CrossOrigin("*")
public class AdminScreenController {

    @Autowired
    private ScreenService screenService;

    @GetMapping
    public ResponseEntity<List<ScreenDto>> getAll() {
        return ResponseEntity.ok(screenService.getAllScreens());
    }

    @GetMapping("/theater/{theaterId}")
    public ResponseEntity<List<ScreenDto>> getByTheater(@PathVariable Long theaterId) {
        return ResponseEntity.ok(screenService.getScreensByTheater(theaterId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(screenService.getScreenById(id));
    }

    @PostMapping
    public ResponseEntity<ScreenDto> create(@RequestBody ScreenDto screenDto) {
        return new ResponseEntity<>(screenService.createScreen(screenDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenDto> update(@PathVariable Long id, @RequestBody ScreenDto screenDto) {
        return ResponseEntity.ok(screenService.updateScreen(id, screenDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        screenService.deleteScreen(id);
        return ResponseEntity.ok("Screen deleted successfully");
    }
}
