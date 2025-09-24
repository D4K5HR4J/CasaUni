package com.inatel.fetin.apiscraping.model.Imovel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImovelRepository extends JpaRepository<Imovel, Long> {
    Optional<Imovel> findById(String url);
    List<Imovel> findByTitulo(String name);
    List<Imovel> findByImobiliaria(String imobiliaria);
    boolean existsById(String id);
}