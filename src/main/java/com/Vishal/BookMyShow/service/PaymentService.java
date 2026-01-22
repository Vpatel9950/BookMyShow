package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.dto.PaymentDto;
import com.Vishal.BookMyShow.exception.ResourceNotFoundException;
import com.Vishal.BookMyShow.model.Payment;
import com.Vishal.BookMyShow.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public PaymentDto getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found")
                );

        return mapToDto(payment);
    }

    private PaymentDto mapToDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentTime(payment.getPaymentTime());
        dto.setStatus(String.valueOf(payment.getStatus()));
        dto.setTransactionId(payment.getTransactionId());
        return dto;
    }
}
