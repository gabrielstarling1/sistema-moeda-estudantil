package br.pucminas.moedaestudantil.service;

import br.pucminas.moedaestudantil.model.Vantagem;
import br.pucminas.moedaestudantil.repository.VantagemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VantagemService {

    private final VantagemRepository vantagemRepository;

    public VantagemService(VantagemRepository vantagemRepository) {
        this.vantagemRepository = vantagemRepository;
    }

    public List<Vantagem> listarTodas() {
        return vantagemRepository.findAll();
    }
}
