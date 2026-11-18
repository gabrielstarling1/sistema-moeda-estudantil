package br.pucminas.moedaestudantil;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URI;

@SpringBootApplication
public class SistemaMoedaEstudantilApplication {

    public static void main(String[] args) {
        configurarBancoDeDadosNuvem();
        SpringApplication.run(SistemaMoedaEstudantilApplication.class, args);
    }

    /**
     * Converte URLs no formato postgres:// ou postgresql:// (padrao do Render)
     * para o formato JDBC esperado pelo Spring Datasource / PostgreSQL.
     */
    public static String normalizarDatabaseUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return rawUrl;
        }
        String limpa = rawUrl.trim();
        if (!limpa.startsWith("postgres://") && !limpa.startsWith("postgresql://")) {
            return limpa;
        }
        URI uri = URI.create(limpa);
        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("URL de banco de dados inválida: host ausente.");
        }
        int porta = uri.getPort() > 0 ? uri.getPort() : 5432;
        String caminho = uri.getPath() != null ? uri.getPath() : "";
        String query = uri.getRawQuery() != null && !uri.getRawQuery().isBlank()
                ? "?" + uri.getRawQuery()
                : "";
        return "jdbc:postgresql://" + host + ":" + porta + caminho + query;
    }

    static void configurarBancoDeDadosNuvem() {
        String rawUrl = obterVariavel("DB_URL");
        if (rawUrl == null) {
            rawUrl = obterVariavel("DATABASE_URL");
        }
        if (rawUrl == null) {
            return;
        }
        String limpa = rawUrl.trim();
        if (limpa.startsWith("postgres://") || limpa.startsWith("postgresql://")) {
            URI uri = URI.create(limpa);
            String userInfo = uri.getUserInfo();
            if (userInfo != null && !userInfo.isBlank()) {
                String[] partes = userInfo.split(":", 2);
                definirSeAusente("DB_USER", partes[0]);
                if (partes.length > 1) {
                    definirSeAusente("DB_PASSWORD", partes[1]);
                }
            }
            System.setProperty("DB_URL", normalizarDatabaseUrl(limpa));
        } else if (limpa.startsWith("jdbc:")) {
            definirSeAusente("DB_URL", limpa);
        }
    }

    private static String obterVariavel(String nome) {
        String prop = System.getProperty(nome);
        if (prop != null && !prop.isBlank()) {
            return prop;
        }
        String env = System.getenv(nome);
        return (env != null && !env.isBlank()) ? env : null;
    }

    private static void definirSeAusente(String chave, String valor) {
        if (valor != null && !valor.isBlank() && obterVariavel(chave) == null) {
            System.setProperty(chave, valor);
        }
    }
}
