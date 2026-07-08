package org.moysha.market_service.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.moysha.market_service.dto.*;
import org.moysha.market_service.exceptions.MessageException;
import org.moysha.market_service.models.News;
import org.moysha.market_service.services.BugReportService;
import org.moysha.market_service.services.NewsService;
import org.moysha.market_service.services.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
@Tag(name = "Запросы")
public class RequestController {

    @Value("${adminKey}")
    private String adminKey;

    private final UserService service;
    private final BugReportService bugReportService;
    private final UserService userService;
    private final NewsService newsService;

    @PostMapping("/bugReport")
    @Operation(summary = "Сообщить о проблеме")
    public void bugReport(@RequestBody @Valid BugReportRequest bugReportRequest) {
        System.err.println("#####   NEW BUG REPORT  #####");
        bugReportService.createBugReport(bugReportRequest);
    }

    @PostMapping("/getAdmin")
    @Operation(summary = "becomeAdmin")
    public void exampleAdmin(@RequestBody BecomeAdminReq becomeAdminReq) {
        if (Objects.equals(becomeAdminReq.getAdmPasswd(),adminKey)) {
            userService.setRole();

        } else {
            throw new MessageException("Код не подходит");
        }
    }

    @PostMapping(value = "/changeProfile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> changeProfile(
            @RequestPart("payload") @Valid ChangeProfileReq changeProfileReq,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile
    ) throws IOException {
        System.err.println("CHANGE PROFILE");
        userService.changeProfile(changeProfileReq, logoFile);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/getMyProfile")
    public ResponseEntity<ProfileResp> getMyProfile() {
        return ResponseEntity.ok(userService.getProfileInfo());
    }

    @GetMapping("/deleteMyAccount")
    public ResponseEntity<Void> deleteAccount() {
        System.err.println("#####   DELETE ACCOUNT  #####");
        userService.deleteUserAndBrockerageAccount();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/news")
    @Operation(summary = "Получить новости")
    public ResponseEntity<List<News>> getNews() {
        return ResponseEntity.ok(newsService.getNews());
    }

}
