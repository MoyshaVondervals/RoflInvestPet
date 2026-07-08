package org.moysha.market_service.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = TickerValidator.class)
@Documented
public @interface TickerValidation {
    String message() default "Невалидный тикер";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
