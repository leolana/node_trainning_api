import { DateTime } from 'luxon';

const listConsolidatedDataForProvider = (db, siscofWrapper) => (
  idFornecedor,
  diasPeriodo,
) => {
  const fetched: any = {};

  function getFornecedor() {
    return db.entities.participante
      .findOne({
        attributes: ['documento', 'nome', 'razaoSocial', 'id'],
        where: { id: idFornecedor },
      })
      .then((participante) => {
        if (!participante) {
          throw new Error('participante-nao-encontrado');
        }
        fetched.fornecedor = participante;
      });
  }

  let dataSolicitacaoDesde = null;
  const dataSolicitacaoAte = DateTime.local();

  if (diasPeriodo) {
    dataSolicitacaoDesde = dataSolicitacaoAte
      .minus({ days: diasPeriodo })
      .startOf('day').toJSDate();
  }

  function getCessoes() {
    const promise = siscofWrapper.getCessoesRealizadas({
      idFornecedor,
      dataSolicitacaoDesde,
      dataSolicitacaoAte,
    });

    return promise.then((result) => {
      fetched.cessoes = result.cessoes;
    });
  }

  function getAntecipacoes() {
    const promise = siscofWrapper.getAntecipacoesConsolidado({
      idFornecedor,
      dataSolicitacaoDesde,
      dataSolicitacaoAte,
    });

    return promise.then((result) => {
      fetched.antecipacoes = result.antecipacoes;
    });
  }

  function asNumber(input) {
    return parseFloat(input) || 0;
  }

  function mapCessaoPorEstabelecimento() {
    const estabelecimentos = {};

    fetched.cessoes.forEach((cessao) => {
      const id = cessao.codigoLoja;

      if (!estabelecimentos[id]) {
        estabelecimentos[id] = {
          estabelecimento: {
            id,
            nome: cessao.nomeFantasia,
            cnpj: cessao.cnpj,
          },
          cessoes: [],
          totalCessao: 0,
        };
      }

      estabelecimentos[id].cessoes.push(cessao);
      estabelecimentos[id].totalCessao += asNumber(cessao.valor);
    });

    return Object.values(estabelecimentos);
  }

  function soma(key, array) {
    return array
      .reduce((accumulator, item) => accumulator + asNumber(item[key]), 0);
  }

  function mapResult() {
    const cessaoPorEstabelecimento = mapCessaoPorEstabelecimento();

    const result = {
      fornecedor: fetched.fornecedor,

      cessao: cessaoPorEstabelecimento,
      totalCessao: soma('totalCessao', cessaoPorEstabelecimento),

      antecipacao: fetched.antecipacoes,
      totalAntecipacao: soma('valorAntecipado', fetched.antecipacoes),
    };

    return result;
  }

  return Promise
    .all([
      getFornecedor(),
      getCessoes(),
      getAntecipacoes(),
    ])
    .then(mapResult);
};

export default listConsolidatedDataForProvider;
