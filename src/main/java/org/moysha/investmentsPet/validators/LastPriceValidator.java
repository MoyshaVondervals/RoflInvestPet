
package org.moysha.investmentsPet.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class LastPriceValidator implements ConstraintValidator<LastPriceValidation, Double> {
    @Override
    public boolean isValid(Double value, ConstraintValidatorContext context) {
        if (value == null) return true;
        return value > 0;
    }
}
