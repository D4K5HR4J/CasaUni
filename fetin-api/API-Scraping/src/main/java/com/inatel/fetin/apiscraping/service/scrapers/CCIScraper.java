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
public class CCIScraper implements Scraper {

    @Override
    public List<Imovel> scrape() {
        List<Imovel> imoveis = new ArrayList<>();
        String url = "https://www.cciimoveismg.com.br/alugar/mg/santa-rita-do-sapucai/valor-min_0/area-min_0/ordem-valor/resultado-crescente/quantidade-48";

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(30000)
                    .get();

            Elements propertyBoxes = doc.select(".resultado.resultado_lista.resultado_");

            for (Element box : propertyBoxes) {
                String id = "https://www.cciimoveismg.com.br"+box.selectFirst("[data-img]").selectFirst("a").attr("href");

                String titulo = box.selectFirst(".localizacao span").text();

                Element precoElement =box.selectFirst(".dados").selectFirst(".alinha_valores");
                String preco;
                if(precoElement.selectFirst(".valor.sep_valor h5") == null)
                {
                    preco = precoElement.selectFirst(".valor h5").text();
                }
                else
                {
                    preco = precoElement.selectFirst(".valor.sep_valor h5").text();
                }

                String imagem = box.selectFirst("[data-img]")!= null ?
                        box.selectFirst("[data-img]").attr("data-img"):
                        "https://demofree.sirv.com/nope-not-here.jpg";


                imoveis.add(new Imovel(id, titulo, preco, imagem, "CCI Imoveis"));
            }

        } catch (IOException e) {
            System.err.println("Erro ao fazer scraping CCI: " + e.getMessage());
        }

        return imoveis;
    }
}
