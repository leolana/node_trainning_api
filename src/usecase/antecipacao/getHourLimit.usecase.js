const params = require('../../service/antecipacao/antecipacaoParams.const');

module.exports = () => {
  const get = () => Promise.resolve(params.limite);

  const format = limite => `${limite.hora}:${limite.minuto}`;


  return get().then(format);
};
