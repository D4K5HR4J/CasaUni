package com.inatel.fetin.apiscraping.service.scrapers;

import com.inatel.fetin.apiscraping.model.Imovel.Imovel;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class KallasScraper implements Scraper {

    @Override
    public List<Imovel> scrape() {
        List<Imovel> imoveis = new ArrayList<>();
        String url = "https://www.kallasimoveis.com/filtro/list/locacao/todos/santa-rita-do-sapucai/todos/0-10000000/todos/1";

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(30000)
                    .get();

            Elements propertyBoxes = doc.select(".div-block-11.w-inline-block");

            for (Element box : propertyBoxes) {
                String id = box.selectFirst("a").attr("href");
                String titulo = box.selectFirst(".text-block-15").text();
                String preco = box.selectFirst(".text-block-11").text();

                String imagem = "https://demofree.sirv.com/nope-not-here.jpg";
                Element imgElement = box.selectFirst(".property-image");
                if (imgElement != null) {
                    imagem = imgElement.attr("src");
                }

                imoveis.add(new Imovel(id, titulo, preco, imagem, "Kallas Imóveis"));
            }

        } catch (IOException e) {
            System.err.println("Erro ao fazer scraping Kallas: " + e.getMessage());
        }

        return imoveis;
    }
}
