package com.inatel.fetin.apiscraping.service.scrapers;

import com.inatel.fetin.apiscraping.model.Imovel.Imovel;
import java.util.List;

public interface Scraper {
    List<Imovel> scrape();
}