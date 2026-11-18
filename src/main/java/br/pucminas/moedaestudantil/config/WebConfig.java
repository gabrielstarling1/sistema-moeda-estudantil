package br.pucminas.moedaestudantil.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;
import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final String pastaUploads;
    private final String[] origensPermitidas;

    public WebConfig(AuthInterceptor authInterceptor,
                     @Value("${app.uploads.dir:uploads}") String pastaUploads,
                     @Value("${app.cors.allowed-origins:*}") String origensPermitidas) {
        this.authInterceptor = authInterceptor;
        this.pastaUploads = pastaUploads;
        this.origensPermitidas = Arrays.stream(origensPermitidas.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(origensPermitidas)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/instituicoes");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Fotos das vantagens gravadas em disco pelo VantagemService
        String local = Paths.get(pastaUploads).toAbsolutePath().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(local.endsWith("/") ? local : local + "/");
    }
}
