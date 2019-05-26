module.exports = di => {
    di.provide('@@cessao-recebivel-status', () => Promise.resolve({
        pagamentoPendente: 1,
        pagamentoEfetuado: 2,
        pagamentoCancelado: 3,
    }));
};