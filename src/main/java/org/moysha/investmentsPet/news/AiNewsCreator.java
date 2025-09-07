package org.moysha.investmentsPet.news;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

import org.moysha.investmentsPet.dto.StockRes;
import org.moysha.investmentsPet.enums.EconomicalSector;
import org.moysha.investmentsPet.models.Stock;
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


    public String createRequest() {
        List<StockRes> stocksList = stockService.getStocksList();
        StringBuilder stocksForRequest = new StringBuilder();
        for (StockRes stockRes : stocksList) {
            String stock = ("ticker: " + stockRes.getTicker() + ", sector: " + stockRes.getSector() + ", last price:" + stockRes.getLastPrice() + ", available for: " + stockRes.getStatus() + "\n");
            stocksForRequest.append(stock);
        }
        System.err.println("stocksForRequest: " + stocksForRequest);
        return "Ты — финансовый аналитик и сценарист экономических событий. " +
                "Вот компании с их секторами: " + stocksForRequest
                + "Составь одно экономическое событие с заголовком и новостью, которое влияет на один или несколько секторов, добавляй в ответ только те акции на которые есть влияние. \n" +
                "Для каждой компании указать, как её цена изменится в процентах, причём изменение зависит от типа доступности акции: BASIC, QUALIFIED, SUPER_QUALIFIED (например, для акций доступных BASIC меньше колебания, для SUPER_QUALIFIED — больше). \n" +
                "Сделай событие разнообразным и интересным, избегай повторов с типичными новостями, новости должны быть реалистичными."+
                "Структура ответа JSON должна быть следующая: " +
                "{" +
                "    'event_title': 'текст заголовка'," +
                "    'event_news': 'текст новости'," +
                "    'affected_sectors': ['список секторов']," +
                "    'stock_impacts': {" +
                "    ['имя акции']: '+-x%'," +
                "    " +
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


    public static void parseJson(String response) throws JsonProcessingException {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            JsonNode choices = root.get("choices");
            JsonNode message = choices.get(0).get("message");
            JsonNode content = message.get("content");
            String strContent = content.asText();
            System.err.println(strContent);
            String clear = strContent.replaceAll("```", "").replaceAll("json", "");
            System.err.println(clear);
            JsonNode eventJson = mapper.readTree(clear);


            String eventTitle = eventJson.get("event_title").asText();
            String eventNews = eventJson.get("event_news").asText();
            System.err.println("Заголовок: " + eventTitle);
            System.err.println("Новость: " + eventNews);

            List<String> affectedSectors = new ArrayList<>();
            for (JsonNode sector : eventJson.path("affected_sectors")) {
                affectedSectors.add(sector.asText());
                System.err.println(sector.asText());
            }


            Map<String, String> stockImpacts = new HashMap<>();
            JsonNode stockImpactsJson = eventJson.get("stock_impacts");
            Iterator<String> fieldNames = stockImpactsJson.fieldNames();
            while (fieldNames.hasNext()) {
                String company = fieldNames.next();
                String change = stockImpactsJson.get(company).asText();
                stockImpacts.put(company, String.valueOf(change));
                System.err.println(company + " -> " + change);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    @Scheduled(cron = "0 0 17 * * *")
    @Async
    public void getAiNews() throws IOException, InterruptedException {
        serverUnavailable = false;
        System.err.println("started scheduled task");
        String prompt = createRequest();
        String aiResponse = sendRequest(prompt);
        parseJson(aiResponse);
    }

    @Scheduled(cron = "@hourly")
    @Async
    public void scheduledTask2() throws IOException, InterruptedException {
        System.err.println("scheduled task2");
        if (serverUnavailable) {
            getAiNews();
        }
    }




}
