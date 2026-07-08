package org.moysha.account_service.repositories;

import org.moysha.account_service.models.News;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsRepository extends JpaRepository<News, Long> {

}
