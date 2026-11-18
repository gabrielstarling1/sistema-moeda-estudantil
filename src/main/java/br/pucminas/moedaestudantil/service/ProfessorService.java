package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.model.Professor;
import br.pucminas.moedaestudantil.repository.ProfessorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ProfessorService {

    private final ProfessorRepository professorRepository;

    public ProfessorService(ProfessorRepository professorRepository) {
        this.professorRepository = professorRepository;
    }

    public List<Professor> listarTodos() {
        return professorRepository.findAll();
    }

    public Professor buscarPorId(Long id) {
        return professorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Professor não encontrado com ID: " + id));
    }

    /**
     * RN04: credita 1.000 moedas, uma unica vez por semestre, somando ao saldo corrente.
     * Professor sem registro de semestre ja recebeu as moedas iniciais do semestre atual.
     *
     * @return quantidade de professores creditados
     */
    @Transactional
    public int creditarSemestreAtual(LocalDate hoje) {
        String semestre = semestreDe(hoje);
        int creditados = 0;
        for (Professor professor : professorRepository.findAll()) {
            if (professor.getUltimoSemestreCreditado() == null) {
                professor.setUltimoSemestreCreditado(semestre);
            } else if (!professor.getUltimoSemestreCreditado().equals(semestre)) {
                professor.creditarSemestre();
                professor.setUltimoSemestreCreditado(semestre);
                creditados++;
            }
        }
        return creditados;
    }

    public static String semestreDe(LocalDate data) {
        return data.getYear() + "/" + (data.getMonthValue() <= 6 ? 1 : 2);
    }
}
