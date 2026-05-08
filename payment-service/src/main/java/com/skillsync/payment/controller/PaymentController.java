package com.skillsync.payment.controller;

import com.skillsync.payment.entity.Payment;
import com.skillsync.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<Payment> createPaymentIntent(@RequestBody Map<String, Object> request) throws Exception {
        Long sessionId = Long.parseLong(request.get("sessionId").toString());
        Long userId = Long.parseLong(request.get("userId").toString());
        Double amount = Double.parseDouble(request.get("amount").toString());
        
        return ResponseEntity.ok(paymentService.createPaymentIntent(sessionId, userId, amount));
    }

    @PostMapping("/confirm/{intentId}")
    public ResponseEntity<Payment> confirmPayment(@PathVariable String intentId) {
        return ResponseEntity.ok(paymentService.confirmPayment(intentId));
    }
}
