package com.Vishal.BookMyShow.controller.admin;

import com.Vishal.BookMyShow.dto.ShowDto;
import com.Vishal.BookMyShow.service.ShowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shows")
@CrossOrigin("*")
public class AdminShowController {

    @Autowired
    private ShowService showService;

    @GetMapping
    public ResponseEntity<List<ShowDto>> getAll() {
        return ResponseEntity.ok(showService.getAllShows());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShowDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(showService.getShowById(id));
    }

    @PostMapping
    public ResponseEntity<ShowDto> create(@RequestBody ShowDto showDto) {
        return new ResponseEntity<>(showService.createShow(showDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShowDto> update(@PathVariable Long id, @RequestBody ShowDto showDto) {
        return ResponseEntity.ok(showService.updateShow(id, showDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        showService.deleteShow(id);
        return ResponseEntity.ok("Show deleted successfully");
    }
}
