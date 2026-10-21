package br.pucminas.moedaestudantil.model;

import jakarta.persistence.*;

@Entity
@Table(name = "resgates_vantagem")
@PrimaryKeyJoinColumn(name = "transacao_id")
@DiscriminatorValue("RESGATE")
public class ResgateVantagem extends Transacao {

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "vantagem_id", nullable = false)
    private Vantagem vantagem;

    @OneToOne(mappedBy = "resgateVantagem", cascade = CascadeType.ALL, orphanRemoval = true)
    private Cupom cupom;

    public ResgateVantagem() {
    }

    public ResgateVantagem(Aluno aluno, Vantagem vantagem) {
        super(vantagem.getCustoMoedas());
        this.aluno = aluno;
        this.vantagem = vantagem;
    }

    public Aluno getAluno() {
        return aluno;
    }

    public void setAluno(Aluno aluno) {
        this.aluno = aluno;
    }

    public Vantagem getVantagem() {
        return vantagem;
    }

    public void setVantagem(Vantagem vantagem) {
        this.vantagem = vantagem;
    }

    public Cupom getCupom() {
        return cupom;
    }

    public void setCupom(Cupom cupom) {
        this.cupom = cupom;
    }
}
