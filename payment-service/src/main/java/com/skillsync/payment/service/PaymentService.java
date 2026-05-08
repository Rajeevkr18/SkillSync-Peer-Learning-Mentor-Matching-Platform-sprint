package com.skillsync.payment.service;

import com.skillsync.payment.entity.Payment;
import com.skillsync.payment.entity.PaymentStatus;
import com.skillsync.payment.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository repository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    public Payment createPaymentIntent(Long sessionId, Long userId, Double amount) throws Exception {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (amount * 100)) // Amount in cents
                .setCurrency("usd")
                .putMetadata("sessionId", sessionId.toString())
                .putMetadata("userId", userId.toString())
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Payment payment = Payment.builder()
                .sessionId(sessionId)
                .userId(userId)
                .amount(amount)
                .currency("usd")
                .stripePaymentIntentId(intent.getId())
                .status(PaymentStatus.PENDING)
                .build();

        return repository.save(payment);
    }

    public Payment confirmPayment(String stripePaymentIntentId) {
        Payment payment = repository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found for intent: " + stripePaymentIntentId));
        payment.setStatus(PaymentStatus.COMPLETED);
        return repository.save(payment);
    }
}
