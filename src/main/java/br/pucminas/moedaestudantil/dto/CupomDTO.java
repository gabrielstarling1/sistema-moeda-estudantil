package br.pucminas.moedaestudantil.dto;

import br.pucminas.moedaestudantil.model.ResgateVantagem;

import java.time.LocalDateTime;

/**
 * Cupom visto pela empresa parceira para conferencia da troca presencial (RN10).
 */
public record CupomDTO(
        String codigo,
        String status,
        LocalDateTime emitidoEm,
        String vantagem,
        int custoMoedas,
        String alunoNome,
        String alunoEmail) {

    public static CupomDTO de(ResgateVantagem resgate) {
        return new CupomDTO(
                resgate.getCupom().getCodigo(),
                resgate.getCupom().getStatus().name(),
                resgate.getCupom().getEmitidoEm(),
                resgate.getVantagem().getNome(),
                resgate.getValor(),
                resgate.getAluno().getNome(),
                resgate.getAluno().getEmail());
    }
}
