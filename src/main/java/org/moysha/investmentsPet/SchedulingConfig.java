package org.moysha.investmentsPet;

import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableAsync
@EnableScheduling
public class SchedulingConfig {
    //возможно настроить блокировку для нескольких экземпляров, то на будущее так что вот тут можно глянуть https://habr.com/ru/articles/580062/
}
