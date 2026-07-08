package org.moysha.account_service.repositories;

import org.moysha.account_service.models.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BugReportRepository extends JpaRepository<BugReport, Long> {
}
