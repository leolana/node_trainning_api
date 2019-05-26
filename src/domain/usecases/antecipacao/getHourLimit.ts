import antecipacaoParamsEnum from '../../services/antecipacao/antecipacaoParamsEnum';

const getHourLimit = async () => {
  const limite = antecipacaoParamsEnum.limite;

  return `${limite.hora}:${limite.minuto}`;
};

export default getHourLimit;
