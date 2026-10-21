package br.pucminas.moedaestudantil.dto;

public class AuthResponseDTO {

    private Long id;
    private String login;
    private String nome;
    private String tipoUsuario;
    private String mensagem;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(Long id, String login, String nome, String tipoUsuario, String mensagem) {
        this.id = id;
        this.login = login;
        this.nome = nome;
        this.tipoUsuario = tipoUsuario;
        this.mensagem = mensagem;
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

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTipoUsuario() {
        return tipoUsuario;
    }

    public void setTipoUsuario(String tipoUsuario) {
        this.tipoUsuario = tipoUsuario;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
}
