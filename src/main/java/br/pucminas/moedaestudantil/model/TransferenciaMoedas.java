package br.pucminas.moedaestudantil.model;

import jakarta.persistence.*;

@Entity
@Table(name = "transferencias_moedas")
@PrimaryKeyJoinColumn(name = "transacao_id")
@DiscriminatorValue("TRANSFERENCIA")
public class TransferenciaMoedas extends Transacao {

    @Column(nullable = false, columnDefinition = "TEXT")
    private String motivo;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    public TransferenciaMoedas() {
    }

    public TransferenciaMoedas(Professor professor, Aluno aluno, int valor, String motivo) {
        super(valor);
        this.professor = professor;
        this.aluno = aluno;
        this.motivo = motivo;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public Professor getProfessor() {
        return professor;
    }

    public void setProfessor(Professor professor) {
        this.professor = professor;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }
}
