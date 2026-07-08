package org.moysha.market_service.repositories;

import org.moysha.market_service.models.BugReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BugReportRepository extends JpaRepository<BugReport, Long> {
}
