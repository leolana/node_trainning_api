module.exports = di => {
    di.provide('@@cessao-diluicao-pagamento', () => Promise.resolve({
        diaVencimento: 0,
        seteDias: 7,
        quatorzeDias: 14,
        vinteUmDias: 21
    }));
};
