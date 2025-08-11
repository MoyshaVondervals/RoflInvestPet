
package org.moysha.investmentsPet.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = LastPriceValidator.class)
@Documented
public @interface LastPriceValidation {
    String message() default "Цена должна быть положительным числом";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
