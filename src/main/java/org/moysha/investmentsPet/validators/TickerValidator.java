
package org.moysha.investmentsPet.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TickerValidator implements ConstraintValidator<TickerValidation, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;
        return value.matches("^[A-Z]{1,6}$");
    }
}
