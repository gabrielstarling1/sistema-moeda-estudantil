package br.pucminas.moedaestudantil.repository;

import br.pucminas.moedaestudantil.model.InstituicaoEnsino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstituicaoRepository extends JpaRepository<InstituicaoEnsino, Long> {
    Optional<InstituicaoEnsino> findByNome(String nome);
    boolean existsByNome(String nome);
}
