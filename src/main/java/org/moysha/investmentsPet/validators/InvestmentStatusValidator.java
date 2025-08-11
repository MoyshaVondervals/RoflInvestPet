
package org.moysha.investmentsPet.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.moysha.investmentsPet.enums.InvestmentStatus;

import java.util.EnumSet;

public class InvestmentStatusValidator implements ConstraintValidator<InvestmentStatusValidation, InvestmentStatus> {
    @Override
    public boolean isValid(InvestmentStatus value, ConstraintValidatorContext context) {
        if (value == null) return true;
        return EnumSet.allOf(InvestmentStatus.class).contains(value);
    }
}
