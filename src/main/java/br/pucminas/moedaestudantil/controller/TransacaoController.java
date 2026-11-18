package br.pucminas.moedaestudantil.controller;

import br.pucminas.moedaestudantil.dto.CupomDTO;
import br.pucminas.moedaestudantil.dto.ExtratoDTO;
import br.pucminas.moedaestudantil.dto.ResgateRequestDTO;
import br.pucminas.moedaestudantil.dto.TransacaoDTO;
import br.pucminas.moedaestudantil.dto.TransferenciaRequestDTO;
import br.pucminas.moedaestudantil.dto.UsuarioSessao;
import br.pucminas.moedaestudantil.service.TransacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    @GetMapping
    public ResponseEntity<List<TransacaoDTO>> listarTodas() {
        return ResponseEntity.ok(transacaoService.listarTodas());
    }

    @PostMapping("/transferencias")
    public ResponseEntity<TransacaoDTO> enviarMoedas(@Valid @RequestBody TransferenciaRequestDTO dto,
                                                     @RequestAttribute(UsuarioSessao.ATRIBUTO) UsuarioSessao sessao) {
        sessao.exigirTipo("PROFESSOR");
        return ResponseEntity.status(HttpStatus.CREATED).body(transacaoService.enviarMoedas(sessao.id(), dto));
    }

    @PostMapping("/resgates")
    public ResponseEntity<TransacaoDTO> resgatarVantagem(@Valid @RequestBody ResgateRequestDTO dto,
                                                         @RequestAttribute(UsuarioSessao.ATRIBUTO) UsuarioSessao sessao) {
        sessao.exigirTipo("ALUNO");
        return ResponseEntity.status(HttpStatus.CREATED).body(transacaoService.resgatarVantagem(sessao.id(), dto));
    }

    @GetMapping("/extrato")
    public ResponseEntity<ExtratoDTO> consultarExtrato(@RequestAttribute(UsuarioSessao.ATRIBUTO) UsuarioSessao sessao) {
        return ResponseEntity.ok(transacaoService.consultarExtrato(sessao));
    }

    @GetMapping("/cupons")
    public ResponseEntity<List<CupomDTO>> listarCuponsDaEmpresa(@RequestAttribute(UsuarioSessao.ATRIBUTO) UsuarioSessao sessao) {
        sessao.exigirTipo("EMPRESA");
        return ResponseEntity.ok(transacaoService.listarCuponsDaEmpresa(sessao.id()));
    }

    @PostMapping("/cupons/{codigo}/utilizar")
    public ResponseEntity<CupomDTO> utilizarCupom(@PathVariable String codigo,
                                                  @RequestAttribute(UsuarioSessao.ATRIBUTO) UsuarioSessao sessao) {
        sessao.exigirTipo("EMPRESA");
        return ResponseEntity.ok(transacaoService.utilizarCupom(sessao.id(), codigo));
    }
}
