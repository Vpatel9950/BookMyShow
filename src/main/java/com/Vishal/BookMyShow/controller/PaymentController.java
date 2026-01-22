package com.Vishal.BookMyShow.controller;

import com.Vishal.BookMyShow.dto.PaymentDto;
import com.Vishal.BookMyShow.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDto> getPayment(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                paymentService.getPaymentById(id)
        );
    }
}

