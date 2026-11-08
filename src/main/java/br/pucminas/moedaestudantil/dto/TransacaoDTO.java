package br.pucminas.moedaestudantil.dto;

import br.pucminas.moedaestudantil.model.Cupom;
import br.pucminas.moedaestudantil.model.ResgateVantagem;
import br.pucminas.moedaestudantil.model.Transacao;
import br.pucminas.moedaestudantil.model.TransferenciaMoedas;

import java.time.LocalDateTime;

/**
 * Linha do extrato. O tipo depende de quem consulta:
 * ENVIO (professor), RECEBIMENTO e RESGATE (aluno) ou TRANSFERENCIA (visao geral).
 */
public record TransacaoDTO(
        Long id,
        String tipo,
        LocalDateTime dataHora,
        int valor,
        String descricao,
        String contraparte,
        String codigoCupom,
        String statusCupom) {

    public static TransacaoDTO de(Transacao transacao, String perspectiva) {
        if (transacao instanceof TransferenciaMoedas t) {
            boolean professor = "PROFESSOR".equals(perspectiva);
            boolean aluno = "ALUNO".equals(perspectiva);
            String tipo = professor ? "ENVIO" : aluno ? "RECEBIMENTO" : "TRANSFERENCIA";
            String contraparte = professor ? t.getAluno().getNome() : t.getProfessor().getNome();
            return new TransacaoDTO(t.getId(), tipo, t.getDataHora(), t.getValor(),
                    t.getMotivo(), contraparte, null, null);
        }
        ResgateVantagem r = (ResgateVantagem) transacao;
        Cupom cupom = r.getCupom();
        return new TransacaoDTO(r.getId(), "RESGATE", r.getDataHora(), r.getValor(),
                r.getVantagem().getNome(), r.getVantagem().getEmpresaParceira().getNome(),
                cupom != null ? cupom.getCodigo() : null,
                cupom != null ? cupom.getStatus().name() : null);
    }
}
