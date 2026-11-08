package br.pucminas.moedaestudantil.repository;

import br.pucminas.moedaestudantil.model.ResgateVantagem;
import br.pucminas.moedaestudantil.model.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    @Query("select r from ResgateVantagem r where r.vantagem.empresaParceira.id = :empresaId order by r.dataHora desc")
    List<ResgateVantagem> findResgatesPorEmpresa(@Param("empresaId") Long empresaId);

    @Query("select count(r) from ResgateVantagem r where r.vantagem.id = :vantagemId")
    long contarResgatesPorVantagem(@Param("vantagemId") Long vantagemId);

    @Query("select count(r) from ResgateVantagem r where r.vantagem.empresaParceira.id = :empresaId")
    long contarResgatesPorEmpresa(@Param("empresaId") Long empresaId);

    @Query("select count(t) from TransferenciaMoedas t where t.aluno.id = :alunoId")
    long contarRecebimentosPorAluno(@Param("alunoId") Long alunoId);

    @Query("select count(r) from ResgateVantagem r where r.aluno.id = :alunoId")
    long contarResgatesPorAluno(@Param("alunoId") Long alunoId);
}
