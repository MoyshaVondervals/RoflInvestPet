# Сборка выполняется из корня репозитория (context: .), т.к. это gradle-мультимодуль.
# syntax=docker/dockerfile:1
FROM eclipse-temurin:19-jdk AS build
WORKDIR /workspace
COPY gradlew settings.gradle.kts build.gradle.kts ./
COPY gradle gradle
COPY modules/account-service modules/account-service
COPY modules/market-service modules/market-service
RUN chmod +x gradlew && ./gradlew :market-service:bootJar -x test --no-daemon

FROM eclipse-temurin:19-jre
WORKDIR /app
COPY --from=build /workspace/modules/market-service/build/libs/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
