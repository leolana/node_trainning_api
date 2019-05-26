module.exports = di => {
    di.provide('@@tipos-pessoa', () => {
        var result = {
            fisica: 1,
            juridica: 2
        };
 
        result.sigla = (tipo) => tipo === result.fisica ? "F" : "J";
 
        return Promise.resolve(result);
    });
 }