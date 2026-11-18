package br.pucminas.moedaestudantil.repository;

import br.pucminas.moedaestudantil.model.Cupom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CupomRepository extends JpaRepository<Cupom, Long> {
    Optional<Cupom> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);
}
