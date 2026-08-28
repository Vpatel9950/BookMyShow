package com.Vishal.BookMyShow.service;

import com.Vishal.BookMyShow.dto.PaymentDto;
import com.Vishal.BookMyShow.exception.ResourceNotFoundException;
import com.Vishal.BookMyShow.model.Payment;
import com.Vishal.BookMyShow.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Value("${razorpay.key_id:rzp_test_S3OTgBs305vzsD}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret:WyhO3S3LIAozahSy8Fuz31aK}")
    private String razorpayKeySecret;

    public PaymentDto getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found")
                );

        return mapToDto(payment);
    }

    public Map<String, Object> createRazorpayOrder(Long bookingId, Double amount) throws Exception {
        int amountInPaise = (int) Math.round(amount * 100);

        RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + bookingId + "_" + System.currentTimeMillis());

        Order order = client.orders.create(orderRequest);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id"));
        response.put("amount", amountInPaise);
        response.put("currency", "INR");
        response.put("keyId", razorpayKeyId);
        response.put("bookingId", bookingId);

        return response;
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
