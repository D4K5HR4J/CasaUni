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
public class MagalhaesScraper implements Scraper {

    @Override
    public List<Imovel> scrape() {
        List<Imovel> imoveis = new ArrayList<>();
        String url = "https://www.magalhaesimoveissrs.com.br/imovel/locacao/todos/santa-rita-do-sapucai";

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(30000)
                    .get();

            Elements propertyBoxes = doc.select(".imovelcard");

            for (Element box : propertyBoxes) {
                if(box.selectFirst(".lista_imoveis_paginacao") != null) {break;}
                String id = "https://www.magalhaesimoveissrs.com.br"+box.selectFirst("a").attr("href");
                String titulo = box.selectFirst(".imovelcard__infocontainer .imovelcard__info__local").text();
                String preco = box.selectFirst(".imovelcard__infocontainer .imovelcard__valor__valor" ).text().replace("R$ ", "");

                String imagem = "https://demofree.sirv.com/nope-not-here.jpg";
                Element imgElement = box.selectFirst(".col.imovelcard__img img");
                if (imgElement != null) {
                    imagem = imgElement.attr("src");
                }

                imoveis.add(new Imovel(id, titulo, preco, imagem, "Magalhaes"));
            }

        } catch (IOException e) {
            System.err.println("Erro ao fazer scraping Magalhaes: " + e.getMessage());
        }

        return imoveis;
    }
}
