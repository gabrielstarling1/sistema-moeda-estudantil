package br.pucminas.moedaestudantil.controller;

import br.pucminas.moedaestudantil.dto.UsuarioSessao;
import br.pucminas.moedaestudantil.dto.VantagemRequestDTO;
import br.pucminas.moedaestudantil.model.Vantagem;
import br.pucminas.moedaestudantil.service.VantagemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vantagens")
public class VantagemController {

    private final VantagemService vantagemService;

    public VantagemController(VantagemService vantagemService) {
        this.vantagemService = vantagemService;
    }

    @GetMapping
    public ResponseEntity<List<Vantagem>> listarTodas(@RequestParam(required = false) Long empresaId) {
        if (empresaId != null) {
            return ResponseEntity.ok(vantagemService.listarPorEmpresa(empresaId));
        }
        return ResponseEntity.ok(vantagemService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vantagem> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(vantagemService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Vantagem> cadastrar(@Valid @RequestBody VantagemRequestDTO dto,
                                              @RequestAttribute(UsuarioSessao.ATRIBUTO) UsuarioSessao sessao) {
        sessao.exigirTipo("EMPRESA");
        Vantagem salva = vantagemService.cadastrar(sessao.id(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vantagem> atualizar(@PathVariable Long id, @Valid @RequestBody VantagemRequestDTO dto,
                                              @RequestAttribute(UsuarioSessao.ATRIBUTO) UsuarioSessao sessao) {
        sessao.exigirTipo("EMPRESA");
        return ResponseEntity.ok(vantagemService.atualizar(id, sessao.id(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @RequestAttribute(UsuarioSessao.ATRIBUTO) UsuarioSessao sessao) {
        sessao.exigirTipo("EMPRESA");
        vantagemService.excluir(id, sessao.id());
        return ResponseEntity.noContent().build();
    }
}
