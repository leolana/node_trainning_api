module.exports = di => {
    di.provide('@@antecipacao-status', () => Promise.resolve({
        solicitado: 1,
        pago: 2,
    }));
};
