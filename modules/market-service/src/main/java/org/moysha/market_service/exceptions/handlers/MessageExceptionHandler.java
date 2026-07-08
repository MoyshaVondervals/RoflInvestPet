package org.moysha.market_service.exceptions.handlers;

import org.moysha.market_service.exceptions.MessageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class MessageExceptionHandler {
    @ExceptionHandler(MessageException.class)
    public ResponseEntity<Object> handleUserAlreadyExists(MessageException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("message", ex.getMessage());

        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

}
