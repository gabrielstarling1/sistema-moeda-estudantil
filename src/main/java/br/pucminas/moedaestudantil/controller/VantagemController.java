package br.pucminas.moedaestudantil.controller;

import br.pucminas.moedaestudantil.model.Vantagem;
import br.pucminas.moedaestudantil.service.VantagemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vantagens")
public class VantagemController {

    private final VantagemService vantagemService;

    public VantagemController(VantagemService vantagemService) {
        this.vantagemService = vantagemService;
    }

    @GetMapping
    public ResponseEntity<List<Vantagem>> listarTodas() {
        return ResponseEntity.ok(vantagemService.listarTodas());
    }
}
