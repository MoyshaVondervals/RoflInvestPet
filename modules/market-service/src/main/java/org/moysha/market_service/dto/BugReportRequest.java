package org.moysha.market_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BugReportRequest {
    @Schema(description = "Имя пользователя", example = "Jon")
    @Size(min = 5, max = 20, message = "Имя пользователя должно содержать от 5 до 50 символов")
    @NotBlank(message = "Имя пользователя не может быть пустыми")
    private String username;

    @Schema(description = "Заголовок", example = "bug report title")
    @NotBlank(message = "Заголовок")
    private String title;

    @Schema(description = "Текст", example = "bug report text")
    @NotBlank(message = "Заголовок")
    private String text;
}
