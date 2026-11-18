package br.pucminas.moedaestudantil.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "tipo_usuario", discriminatorType = DiscriminatorType.STRING)
public abstract class Usuario {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String login;

    @JsonIgnore
    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    public Usuario() {
    }

    public Usuario(String login, String senhaHash) {
        this.login = login;
        this.senhaHash = senhaHash;
    }

    public boolean autenticar(String login, String senha) {
        return this.login != null && this.login.equals(login)
                && this.senhaHash != null && senha != null
                && ENCODER.matches(senha, this.senhaHash);
    }

    /**
     * Armazena apenas o hash BCrypt da senha informada (RN01).
     */
    public void definirSenha(String senhaPura) {
        if (senhaPura == null || senhaPura.isBlank()) {
            throw new IllegalArgumentException("A senha é obrigatória.");
        }
        this.senhaHash = ENCODER.encode(senhaPura);
    }

    @JsonIgnore
    public boolean isSenhaComHash() {
        return this.senhaHash != null && this.senhaHash.startsWith("$2");
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }
}
