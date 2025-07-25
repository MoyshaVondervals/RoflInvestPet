package org.moysha.investmentsPet.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moysha.investmentsPet.dto.BecomeAdminReq;
import org.moysha.investmentsPet.dto.BugReportRequest;
import org.moysha.investmentsPet.exceptions.MessageException;
import org.moysha.investmentsPet.services.BugReportService;
import org.moysha.investmentsPet.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
@Tag(name = "Запросы")
public class RequestController {
    private final UserService service;
    private final BugReportService bugReportService;
    private final UserService userService;

    @PostMapping("/bugReport")
    @Operation(summary = "Сообщить о проблеме")
    public void bugReport( @RequestBody @Valid BugReportRequest bugReportRequest) {
        System.err.println("#####   NEW BUG REPORT  #####");
        bugReportService.createBugReport(bugReportRequest);
    }


    @PostMapping("/getAdmin")
    @Operation(summary = "becomeAdmin")
    public void exampleAdmin(@RequestBody BecomeAdminReq becomeAdminReq) {
        if (Objects.equals(becomeAdminReq.getAdmPasswd(), "ADM_SECRET_KEY")){
            userService.setRole();

        }
        else{
            throw new MessageException("Код не подходит");
        }


    }


}
