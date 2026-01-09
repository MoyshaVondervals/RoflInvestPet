package org.moysha.investmentsPet.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SectorValidator.class)
@Documented
public @interface SectorValidation {
    String message() default "Сектор не валиден";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
