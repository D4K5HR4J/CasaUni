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
public class JCarvalhoScraper implements Scraper {

    @Override
    public List<Imovel> scrape() {
        List<Imovel> imoveis = new ArrayList<>();
        String url = "https://www.jcarvalhoimoveis.com.br/buscarImoveis.php?aluguelVenda=aluguel&cidade=Santa+Rita+do+Sapucaí";

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(30000)
                    .get();

            Elements propertyBoxes = doc.select(".property-grid-1.property-block.bg-white.transation-this.hover-shadow");

            for (Element box : propertyBoxes) {

                String id = box.selectFirst("a").attr("href");
                id = "https://www.jcarvalhoimoveis.com.br/"+id;
                Document docDentro = Jsoup.connect(id)
                        .userAgent("Mozilla/5.0")
                        .timeout(30000)
                        .get();


                String titulo = "Título não encontrado";
                Element tituloElement = docDentro.selectFirst(".listing-location");
                if (tituloElement != null) {
                    titulo = tituloElement.text();
                }

                String preco = box.selectFirst(".preco__select-aluguel").text().replace(" Aluguel", "");

                String imagem = "https://demofree.sirv.com/nope-not-here.jpg";
                Element imgElement = box.selectFirst(".overflow-hidden.position-relative.transation.thumbnail-img.bg-secondary.hover-img-zoom.capaAnuncio");
                if (imgElement != null) {
                    String style = imgElement.attr("style");
                    imagem =("https://www.jcarvalhoimoveis.com.br/"+style).replace("background: url(", "").replace(")", "");
                }

                imoveis.add(new Imovel(id, titulo, preco, imagem, "JCarvalho Imóveis"));
            }

        } catch (IOException e) {
            System.err.println("Erro ao fazer scraping JCarvalho: " + e.getMessage());
        }

        return imoveis;
    }
}
