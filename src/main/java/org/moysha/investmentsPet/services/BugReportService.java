package org.moysha.investmentsPet.services;

import jakarta.servlet.ServletResponse;
import lombok.RequiredArgsConstructor;
import org.moysha.investmentsPet.dto.BugReportRequest;
import org.moysha.investmentsPet.models.BrokerageAccount;
import org.moysha.investmentsPet.models.BugReport;
import org.moysha.investmentsPet.models.User;
import org.moysha.investmentsPet.repositories.BugReportRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BugReportService {
    private final BugReportRepository bugReportRepository;
    private final UserService userService;
    private final ServletResponse servletResponse;

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
