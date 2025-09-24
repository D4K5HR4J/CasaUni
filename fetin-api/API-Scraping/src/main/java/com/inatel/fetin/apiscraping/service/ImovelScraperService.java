package com.inatel.fetin.apiscraping.service;

import com.inatel.fetin.apiscraping.config.ScraperConfig;
import com.inatel.fetin.apiscraping.model.Imovel.Imovel;
import com.inatel.fetin.apiscraping.service.scrapers.CCIScraper;
import com.inatel.fetin.apiscraping.service.scrapers.CardosoAndradeScraper;
import com.inatel.fetin.apiscraping.service.scrapers.KallasScraper;
import com.inatel.fetin.apiscraping.service.scrapers.LonguinhoScraper;
import com.inatel.fetin.apiscraping.service.scrapers.VilelaScraper;
import com.inatel.fetin.apiscraping.service.scrapers.JCarvalhoScraper;
import com.inatel.fetin.apiscraping.service.scrapers.TiaguinhoAleluiaScraper;
import com.inatel.fetin.apiscraping.service.scrapers.MagalhaesScraper;
import com.inatel.fetin.apiscraping.service.scrapers.Scraper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class ImovelScraperService {

    private final Map<ScraperConfig.FonteImobiliaria, Scraper> scrapers;

    @Autowired
    public ImovelScraperService(
            CardosoAndradeScraper cardosoScraper,
            KallasScraper kallasScraper,
            CCIScraper cciScraper,
            LonguinhoScraper longuinhoScraper,
            VilelaScraper vilelaScraper,
            JCarvalhoScraper jcarvalhoScraper,
            TiaguinhoAleluiaScraper tiaguinhoScraper,
            MagalhaesScraper magalhaesScraper
    ) {
        this.scrapers = new EnumMap<>(ScraperConfig.FonteImobiliaria.class);
        this.scrapers.put(ScraperConfig.FonteImobiliaria.CARDOSO_ANDRADE, cardosoScraper);
        this.scrapers.put(ScraperConfig.FonteImobiliaria.KALLAS, kallasScraper);
        this.scrapers.put(ScraperConfig.FonteImobiliaria.CCI, cciScraper);
        this.scrapers.put(ScraperConfig.FonteImobiliaria.LONGUINHO, longuinhoScraper);
        this.scrapers.put(ScraperConfig.FonteImobiliaria.VILELA, vilelaScraper);
        this.scrapers.put(ScraperConfig.FonteImobiliaria.JCARVALHO, jcarvalhoScraper);
        this.scrapers.put(ScraperConfig.FonteImobiliaria.TIAGUINHO, tiaguinhoScraper);
        this.scrapers.put(ScraperConfig.FonteImobiliaria.MAGALHAES, magalhaesScraper);
    }

    public List<Imovel> scrape(ScraperConfig.FonteImobiliaria fonte) {
        Scraper scraper = scrapers.get(fonte);
        if (scraper != null) {
            return scraper.scrape();
        }
        return Collections.emptyList();
    }
}