# Stage 1: build com Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copiar pom.xml e baixar dependências (cache)
COPY pom.xml .
RUN mvn -B -DskipTests dependency:go-offline

# Copiar código e empacotar
COPY src ./src
RUN mvn -B -DskipTests package

# Stage 2: runtime leve
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copiar jar gerado
ARG JAR_FILE=/workspace/target/*.jar
COPY --from=build ${JAR_FILE} app.jar

EXPOSE 8080
ENV JAVA_OPTS=""

# Iniciar aplicação Spring Boot diretamente
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -jar /app/app.jar" ]
