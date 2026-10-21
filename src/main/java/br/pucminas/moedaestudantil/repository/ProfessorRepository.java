package br.pucminas.moedaestudantil.repository;

import br.pucminas.moedaestudantil.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    Optional<Professor> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
}
