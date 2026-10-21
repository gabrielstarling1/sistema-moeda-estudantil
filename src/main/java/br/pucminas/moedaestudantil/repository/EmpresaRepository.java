package br.pucminas.moedaestudantil.repository;

import br.pucminas.moedaestudantil.model.EmpresaParceira;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpresaRepository extends JpaRepository<EmpresaParceira, Long> {
    Optional<EmpresaParceira> findByCnpj(String cnpj);
    Optional<EmpresaParceira> findByEmail(String email);
    boolean existsByCnpj(String cnpj);
    boolean existsByEmail(String email);
}
