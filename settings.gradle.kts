rootProject.name = "InvestmentsPet"

// gateway убран: фронтенд ходит напрямую в сервисы (через nginx/setupProxy),
// а межсервисное общение идёт через Kafka.
include(":account-service", ":market-service")

project(":account-service").projectDir = file("modules/account-service")
project(":market-service").projectDir = file("modules/market-service")
