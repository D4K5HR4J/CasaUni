package com.inatel.fetin.apiscraping.service;

import com.inatel.fetin.apiscraping.config.ScraperConfig;
import com.inatel.fetin.apiscraping.model.Imovel.Imovel;
import com.inatel.fetin.apiscraping.model.Imovel.ImovelRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ImovelScrapingOrchestrator {

    private final ImovelScraperService imovelScraper;
    private final ImovelRepository imovelRepository;

    @Autowired
    public ImovelScrapingOrchestrator(ImovelScraperService imovelScraper, ImovelRepository imovelRepository) {
        this.imovelScraper = imovelScraper;
        this.imovelRepository = imovelRepository;
    }

    @Transactional
    public Map<String, Object> scrapeByImobiliaria(ScraperConfig.FonteImobiliaria imobiliaria) {
        Map<String, Object> response = new HashMap<>();
        int newImoveis = 0, updatedImoveis = 0;

        List<Imovel> imoveis = imovelScraper.scrape(imobiliaria);

        for (Imovel imovel : imoveis) {
            Optional<Imovel> existentOpt = imovelRepository.findById(imovel.getId());

            if (existentOpt.isPresent()) {
                Imovel existent = existentOpt.get();
                if (!isImovelEqual(existent, imovel)) {
                    existent.setTitulo(imovel.getTitulo());
                    existent.setPreco(imovel.getPreco());
                    existent.setImagem(imovel.getImagem());
                    existent.setImobiliaria(imovel.getImobiliaria());
                    imovelRepository.save(existent);
                    updatedImoveis++;
                }
            } else {
                imovelRepository.save(imovel);
                newImoveis++;
            }
        }

        response.put("fonte", imobiliaria.name());
        response.put("novos", newImoveis);
        response.put("atualizados", updatedImoveis);
        response.put("total", imoveis.size());

        return response;
    }

    @Transactional
    public Map<String, Object> scrapeAll() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Integer> resultsByImobiliaria = new HashMap<>();

        int totalNew = 0, totalUpdated = 0, totalProcessed = 0;

        for (ScraperConfig.FonteImobiliaria imobiliaria : ScraperConfig.FonteImobiliaria.values()) {
            try {
                Map<String, Object> resultad = scrapeByImobiliaria(imobiliaria);
                int novos = (int) resultad.get("novos");
                int atualizados = (int) resultad.get("atualizados");
                int total = (int) resultad.get("total");

                totalNew += novos;
                totalUpdated += atualizados;
                totalProcessed += total;

                resultsByImobiliaria.put(imobiliaria.name(), novos + atualizados);

            } catch (Exception e) {
                resultsByImobiliaria.put(imobiliaria.name() + "_erro", -1);
            }
        }

        response.put("status", "sucesso");
        response.put("novos_imoveis", totalNew);
        response.put("imoveis_atualizados", totalUpdated);
        response.put("total_processados", totalProcessed);
        response.put("resultados_por_fonte", resultsByImobiliaria);

        return response;
    }

    private boolean isImovelEqual(Imovel existent, Imovel newImovel) {
        return Objects.equals(existent.getTitulo(), newImovel.getTitulo()) &&
                Objects.equals(existent.getPreco(), newImovel.getPreco()) &&
                Objects.equals(existent.getImagem(), newImovel.getImagem()) &&
                Objects.equals(existent.getImobiliaria(), newImovel.getImobiliaria());
    }
}

