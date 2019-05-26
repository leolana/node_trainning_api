module.exports = di => {
    di.provide('@@cessao-tipo', () => Promise.resolve({
        cessao: 1,
        recorrenteAprovacaoAutomatica: 2,
        parcelada: 3,
    }));
};
