package org.moysha.market_service.services;

import lombok.RequiredArgsConstructor;
import org.moysha.market_service.enums.EconomicalSector;
import org.moysha.market_service.models.News;
import org.moysha.market_service.repositories.NewsRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsService {
    private final NewsRepository newsRepository;

    public void createNews(String title, String newsContent) {
        News news = News.builder()
                .title(title)
                .text(newsContent)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        newsRepository.save(news);
    }

    public List<News> getNews() {
        return newsRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }
}
