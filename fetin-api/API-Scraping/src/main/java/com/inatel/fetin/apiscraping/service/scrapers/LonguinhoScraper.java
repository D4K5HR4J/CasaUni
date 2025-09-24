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
public class LonguinhoScraper implements Scraper {

    @Override
    public List<Imovel> scrape() {
        List<Imovel> imoveis = new ArrayList<>();
        String url = "https://longuinhoimoveis.com.br/alugar/mg/santa-rita-do-sapucai";

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(30000)
                    .get();

            Elements propertyBoxes = doc.select(".link_resultado");

            for (Element box : propertyBoxes) {
                String id = "https://longuinhoimoveis.com.br"+box.attr("href");
                String titulo = box.selectFirst(".final_card").selectFirst("span").text();
                String preco = box.selectFirst(".valor_novo").selectFirst("h5").text();

                String imagem = "https://demofree.sirv.com/nope-not-here.jpg";
                Element imgElement = box.selectFirst(".foto_imovel img");
                if (imgElement != null) {
                    imagem = imgElement.attr("src");
                }

                imoveis.add(new Imovel(id, titulo, preco, imagem, "Longuinho Imóveis"));
            }

        } catch (IOException e) {
            System.err.println("Erro ao fazer scraping Longuinho: " + e.getMessage());
        }

        return imoveis;
    }
}
