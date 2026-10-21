package br.pucminas.moedaestudantil.model;

import br.pucminas.moedaestudantil.model.enums.StatusCupom;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cupons")
public class Cupom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String codigo;

    @Column(name = "emitido_em", nullable = false)
    private LocalDateTime emitidoEm = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusCupom status = StatusCupom.EMITIDO;

    @JsonIgnore
    @OneToOne(optional = false)
    @JoinColumn(name = "resgate_id", nullable = false, unique = true)
    private ResgateVantagem resgateVantagem;

    public Cupom() {
    }

    public Cupom(String codigo, ResgateVantagem resgateVantagem) {
        this.codigo = codigo;
        this.emitidoEm = LocalDateTime.now();
        this.status = StatusCupom.EMITIDO;
        this.resgateVantagem = resgateVantagem;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public LocalDateTime getEmitidoEm() {
        return emitidoEm;
    }

    public void setEmitidoEm(LocalDateTime emitidoEm) {
        this.emitidoEm = emitidoEm;
    }

    public StatusCupom getStatus() {
        return status;
    }

    public void setStatus(StatusCupom status) {
        this.status = status;
    }

    public ResgateVantagem getResgateVantagem() {
        return resgateVantagem;
    }

    public void setResgateVantagem(ResgateVantagem resgateVantagem) {
        this.resgateVantagem = resgateVantagem;
    }
}
