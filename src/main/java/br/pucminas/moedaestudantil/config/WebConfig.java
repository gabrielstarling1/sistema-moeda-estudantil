package br.pucminas.moedaestudantil.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;
    private final String pastaUploads;

    public WebConfig(AuthInterceptor authInterceptor,
                     @Value("${app.uploads.dir:uploads}") String pastaUploads) {
        this.authInterceptor = authInterceptor;
        this.pastaUploads = pastaUploads;
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
