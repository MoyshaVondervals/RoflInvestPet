package org.moysha.account_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
@EnableConfigurationProperties(KafkaTopics.class)
public class KafkaConfig {

    @Bean
    public NewTopic tradeExecutedTopic(KafkaTopics topics) {
        return TopicBuilder.name(topics.tradeExecuted())
                .partitions(3)
                .replicas(1)
                .build();
    }
}
