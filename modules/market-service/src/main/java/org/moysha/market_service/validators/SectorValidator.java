package org.moysha.market_service.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.moysha.market_service.enums.EconomicalSector;

import java.util.EnumSet;

public class SectorValidator implements ConstraintValidator<SectorValidation, EconomicalSector> {
    @Override
    public boolean isValid(EconomicalSector value, ConstraintValidatorContext context) {
        if (value == null) return true;
        return EnumSet.allOf(EconomicalSector.class).contains(value);
    }
}
