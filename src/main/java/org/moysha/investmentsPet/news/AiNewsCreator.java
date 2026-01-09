package org.moysha.investmentsPet.news;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.moysha.investmentsPet.dto.StockRes;
import org.moysha.investmentsPet.enums.EconomicalSector;
import org.moysha.investmentsPet.enums.GrowPattern;
import org.moysha.investmentsPet.enums.GrowSpeed;
import org.moysha.investmentsPet.models.Stock;
import org.moysha.investmentsPet.models.StockImpact;
import org.moysha.investmentsPet.services.NewsService;
import org.moysha.investmentsPet.services.StockChangeTargetService;
import org.moysha.investmentsPet.services.StockService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Component
@RequiredArgsConstructor
public class AiNewsCreator {

    private boolean serverUnavailable = false;
    private final StockService stockService;
    @Value("${apiKey}")
    private String apiKey;

    private final StockChangeTargetService stockChangeTargetService;
    private final NewsService newsService;


    public static double parsePercent(String s) {
        String cleaned = s.replace("%", "").trim();
        return Double.parseDouble(cleaned);
    }


    public String createRequest() {
        List<StockRes> stocksList = stockService.getStocksList();
        StringBuilder stocksForRequest = new StringBuilder();
        for (StockRes stockRes : stocksList) {
            String stock = ("ticker: " + stockRes.getTicker() + ", sector: " + stockRes.getSector() + ", last price:" + stockRes.getLastPrice() + ", available for: " + stockRes.getStatus() + "\n");
            stocksForRequest.append(stock);
        }

        return "Ты — финансовый аналитик и сценарист экономических событий. " +
                "Вот компании с их секторами: " + stocksForRequest
                + "Составь одно экономическое событие с заголовком и новостью, которое влияет на один или несколько секторов, добавляй в ответ только те акции на которые есть влияние. \n" +
                "Для каждой компании указать, как её цена изменится в процентах, причём изменение зависит от типа доступности акции: BASIC (+-2.0%), QUALIFIED(+-5.0%), SUPER_QUALIFIED(+-10%). Проценты могут быть десятичными, а также как положительными так и отрицательными. \n" +
                "Также для каждой акции указывай характер роста SLOW, MEDIUM, FAST, SUPERFAST" +
                "Сделай событие разнообразным и интересным, избегай повторов с типичными новостями, новости должны быть реалистичными."+
                "Структура ответа JSON должна быть следующая: " +
                "{" +
                "    'event_title': 'текст заголовка'," +
                "    'event_news': 'текст новости'," +
                "    'affected_sectors': ['список секторов']," +
                "    'stock_impacts': {" +
                "    {" +
                "    stockTicker: 'имя акции'" +
                "    impact: '+-x%'," +
                "    speed: 'Скорость изменения'" +
                "    }" +
                "}";
    }

    public String sendRequest(String prompt) throws IOException, InterruptedException {
        String jsonBody = """
                {
                  "model": "meta-llama/llama-3.1-405b-instruct:free",
                  "messages": [
                    {
                      "role": "user",
                      "content": "%s"
                    }
                  ]
                }
                """.formatted(prompt.replace("\"", "\\\""));


        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.err.println("status" + response.statusCode());
        if (response.statusCode() == 200) {

            return response.body();
        }
        else{
            serverUnavailable = true;
            System.err.println("Server is unavailable: "+serverUnavailable);
            throw new IOException("Server is unavailable");
        }
    }


    public void parseJson(String response) throws IOException, InterruptedException {
        List<StockImpact> stockImpacts = new LinkedList<>();
        ArrayList<EconomicalSector> affectedSectors = new ArrayList<>();
        String eventTitle = "";
        String eventNews = "";
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            JsonNode choices = root.get("choices");
            JsonNode message = choices.get(0).get("message");
            JsonNode content = message.get("content");
            String strContent = content.asText();
            String clear = strContent.replaceAll("```", "").replaceAll("json", "");
            JsonNode eventJson = mapper.readTree(clear);


            eventTitle = eventJson.get("event_title").asText();
            eventNews = eventJson.get("event_news").asText();
            System.out.println("Заголовок: " + eventTitle);
            System.out.println("Новость: " + eventNews);


            for (JsonNode sector : eventJson.path("affected_sectors")) {
                affectedSectors.add(EconomicalSector.valueOf(sector.asText()));
                System.out.println(sector.asText());
            }


            for (JsonNode impacts: eventJson.path("stock_impacts")) {
                System.out.println(impacts.get("stockTicker").asText());
                StockImpact stockImpact = StockImpact.builder()
                        .ticker(impacts.get("stockTicker").asText())
                        .impact(parsePercent(impacts.get("impact").asText()))
                        .growSpeed(GrowSpeed.valueOf(impacts.get("speed").asText())).build();
                stockImpacts.add(stockImpact);


            }


        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Parse ERROR");;
            getAiNews();

        }
        newsService.createNews(eventTitle, eventNews);
        destributeStockImpacts(stockImpacts);

    }

    @Transactional
    public void destributeStockImpacts(List<StockImpact> stockImpacts){
        for (StockImpact stockImpact : stockImpacts) {
            stockChangeTargetService.alterTarget(stockImpact);
        }
    }


    @Scheduled(cron = "0 0 */3 * * *")
    @Async
    public void getAiNews() throws IOException, InterruptedException {
        serverUnavailable = false;
        System.err.println("started scheduled task");
        String prompt = createRequest();
        String aiResponse = sendRequest(prompt);
        parseJson(aiResponse);
        System.out.println("Success");;

    }



}
