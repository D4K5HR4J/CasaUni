package com.inatel.fetin.apiscraping.controller;

import com.inatel.fetin.apiscraping.model.Imovel.Imovel;
import com.inatel.fetin.apiscraping.model.Imovel.ImovelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/imoveis")
public class ImovelController {

    @Autowired
    private ImovelRepository repository;

    @GetMapping
    public List<Imovel> getAllImoveis() {
        return repository.findAll();
    }

    @GetMapping("/imobiliaria/{nomeImobiliaria}")
    public List<Imovel> getImoveisByImobiliaria(@PathVariable String nomeImobiliaria) {
        return repository.findByImobiliaria(nomeImobiliaria);
    }
}