package org.moysha.account_service.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = InvestmentStatusValidator.class)
@Documented
public @interface InvestmentStatusValidation {
    String message() default "Некорректный статус инвестора";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
