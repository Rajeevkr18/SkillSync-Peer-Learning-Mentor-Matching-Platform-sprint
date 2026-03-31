package com.skillsync.session.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.queue.session}")
    private String sessionQueue;

    @Value("${rabbitmq.routing-key.session-booked}")
    private String sessionBookedRoutingKey;

    @Value("${rabbitmq.routing-key.session-accepted}")
    private String sessionAcceptedRoutingKey;

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Queue sessionQueue() {
        return new Queue(sessionQueue, true);
    }

    @Bean
    public Binding sessionBookedBinding() {
        return BindingBuilder.bind(sessionQueue())
                .to(exchange())
                .with(sessionBookedRoutingKey);
    }

    @Bean
    public Binding sessionAcceptedBinding() {
        return BindingBuilder.bind(sessionQueue())
                .to(exchange())
                .with(sessionAcceptedRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
