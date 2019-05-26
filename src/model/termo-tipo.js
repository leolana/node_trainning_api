module.exports = di => {
    di.provide('@@termo-tipo', () => Promise.resolve({
        aditivo: 1,
        contratoMaeFornecedor: 2,
        contratoMaeEstabelecimento: 3,
    }));
};
