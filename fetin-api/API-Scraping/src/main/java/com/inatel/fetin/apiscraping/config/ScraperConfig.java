package com.inatel.fetin.apiscraping.config;

public class ScraperConfig {

    public enum FonteImobiliaria {
        CARDOSO_ANDRADE("cardoso-andrade"),
        KALLAS("kallas"),
        CCI("cci"),
        LONGUINHO("longuinho"),
        VILELA("vilela"),
        JCARVALHO("jcarvalho"),
        TIAGUINHO("tiaguinho"),
        MAGALHAES("magalhaes");

        private final String slug;

        FonteImobiliaria(String slug) {
            this.slug = slug;
        }

        public String getSlug() {
            return slug;
        }

        public static FonteImobiliaria fromSlug(String slug) {
            for (FonteImobiliaria fonte : values()) {
                if (fonte.slug.equalsIgnoreCase(slug)) {
                    return fonte;
                }
            }
            throw new IllegalArgumentException("Fonte desconhecida: " + slug);
        }
    }
}