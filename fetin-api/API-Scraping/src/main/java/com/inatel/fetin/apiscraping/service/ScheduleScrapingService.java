package com.inatel.fetin.apiscraping.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@Service
public class ScheduleScrapingService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduleScrapingService.class);

    private final ImovelScrapingOrchestrator orchestrator;

    @Autowired
    public ScheduleScrapingService(ImovelScrapingOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @Scheduled(cron = "0 0 3 * * ?")
    public void executeDailyScraping() {
        logger.info("Iniciando scraping agendado...");
        Map<String, Object> resultado = orchestrator.scrapeAll();
        logger.info("Scraping agendado concluído! Resultado: {}", resultado);
    }
}




