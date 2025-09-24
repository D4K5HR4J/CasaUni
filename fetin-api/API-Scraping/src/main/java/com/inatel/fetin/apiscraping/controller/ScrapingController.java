package com.inatel.fetin.apiscraping.controller;

import com.inatel.fetin.apiscraping.config.ScraperConfig;
import com.inatel.fetin.apiscraping.model.Imovel.Imovel;
import com.inatel.fetin.apiscraping.model.Imovel.ImovelRepository;
import com.inatel.fetin.apiscraping.service.ImovelScraperService;
import com.inatel.fetin.apiscraping.service.ImovelScrapingOrchestrator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api")
public class ScrapingController {

    @Autowired
    private ImovelScrapingOrchestrator imovelScrapingOrchestrator;

    @GetMapping("/scrape/{slug}")
    public Map<String, Object> scrapeImoveis(@PathVariable String slug) {
        try {
            ScraperConfig.FonteImobiliaria imobiliariaEnum = ScraperConfig.FonteImobiliaria.fromSlug(slug);
            return imovelScrapingOrchestrator.scrapeByImobiliaria(imobiliariaEnum);
        } catch (IllegalArgumentException e) {
            return Map.of("status", "erro", "mensagem", "Fonte inválida: " + slug);
        }
    }

    @GetMapping("/scrape/all")
    public Map<String, Object> scrapeAllImoveis() {
        return imovelScrapingOrchestrator.scrapeAll();
    }

}