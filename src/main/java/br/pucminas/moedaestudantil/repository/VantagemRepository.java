package br.pucminas.moedaestudantil.repository;

import br.pucminas.moedaestudantil.model.Vantagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VantagemRepository extends JpaRepository<Vantagem, Long> {
    List<Vantagem> findByEmpresaParceiraId(Long empresaId);
}
