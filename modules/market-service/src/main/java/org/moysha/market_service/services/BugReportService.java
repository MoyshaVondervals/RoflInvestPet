package org.moysha.market_service.services;

import lombok.RequiredArgsConstructor;
import org.moysha.market_service.dto.BugReportRequest;
import org.moysha.market_service.models.BrokerageAccount;
import org.moysha.market_service.models.BugReport;
import org.moysha.market_service.models.User;
import org.moysha.market_service.repositories.BugReportRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BugReportService {
    private final BugReportRepository bugReportRepository;
    private final UserService userService;

    public BugReport createBugReport(BugReportRequest bugReportRequest) {
        System.err.println(bugReportRequest.toString());
        var bugReport = BugReport.builder()
                .userid(userService.getByUsername(bugReportRequest.getUsername()).getId())
                .title(bugReportRequest.getTitle())
                .text(bugReportRequest.getText())
                .build();
        System.err.println(userService.getCurrentUser().getUsername());
        return bugReportRepository.save(bugReport);
    }
}
