module.exports = di => {
    di.provide('@@credenciamento-instalacao-horarios', () => Promise.resolve({
        horarioComercial: 1,
        h24horas: 2,
        manha: 3,
        tarde: 4,
        noite: 5
    }));
};
