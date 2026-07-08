package org.moysha.market_service.repositories;

import org.moysha.market_service.models.News;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsRepository extends JpaRepository<News, Long> {

}
