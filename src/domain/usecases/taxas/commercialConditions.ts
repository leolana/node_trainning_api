const commercialConditions = db => (ramoAtividade, tipoPessoa, faturamentoCartao) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const vigenciaValida = {
    inicio: { $lte: today },
    fim: { $or: { $eq: null, $gte: today } },
  };

  const filtro = {
    ...vigenciaValida,
    ramoAtividadeCodigo: {
      $or: [ramoAtividade, null],
    },
    tipoPessoa: {
      $or: [tipoPessoa, null],
    },
  };

  const queryTaxaContratual = db.entities.taxaContratual.findOne({
    where: filtro,
    order: [['ramoAtividadeCodigo', 'ASC'], ['tipoPessoa', 'ASC']],
    attributes: [
      'id',
      'tipoPessoa',
      'ramoAtividadeCodigo',
      'antecipacao',
      'adesao',
      'maximoParcelas',
    ],
  });

  const queryTaxas = db.entities.taxa.findOne({
    where: filtro,
    include: [
      {
        model: db.entities.taxaBandeira,
        as: 'bandeiras',
        attributes: ['id', 'bandeiraId', ['taxaDebito', 'valor']],
        include: {
          model: db.entities.taxaFaturamento,
          as: 'faturamentos',
          attributes: ['faturamentoCartaoId', 'coeficiente'],
          where: { faturamentoCartaoId: faturamentoCartao },
        },
      },
      {
        model: db.entities.taxaPrazo,
        as: 'prazos',
        order: [['prazo', 'ASC']],
        attributes: [
          'id',
          'coeficiente',
          'prazo',
          ['minimo', 'minimoParcelas'],
          ['maximo', 'maximoParcelas'],
        ],
        include: {
          model: db.entities.taxaAdministrativa,
          as: 'taxasAdministrativas',
          attributes: ['id', 'bandeiraId', 'valorBase'],
          order: [['bandeiraId', 'ASC']],
        },
      },
    ],
  });

  return Promise.all([queryTaxaContratual, queryTaxas]).then((results) => {
    const [taxaContratual, taxas] = results;

    const configbandeiras = taxas.bandeiras.map(b => b.dataValues);
    const debitos = configbandeiras.map(c => ({
      id: c.id,
      bandeiraId: c.bandeiraId,
      valor: c.valor,
    }));

    const taxasAdministrativas = taxas.prazos
      .map(p => p.dataValues)
      .reduce((accumulator, current) => {
        let result = accumulator.find(a => a.prazo === current.prazo);
        if (!result) {
          result = {
            prazo: current.prazo,
            opcoesParcelamento: [],
            valores: [],
          };
          accumulator.push(result);
        }

        result.opcoesParcelamento.push({
          minimoParcelas: current.minimoParcelas,
          maximoParcelas: current.maximoParcelas,
        });

        const valores = current.taxasAdministrativas.map(t => ({
          id: t.id,
          bandeiraId: t.bandeiraId,
          minimo: current.minimoParcelas,
          maximo: current.maximoParcelas,
          valor:
            t.valorBase +
            current.coeficiente +
            configbandeiras.find(c => c.bandeiraId === t.bandeiraId)
              .faturamentos[0].coeficiente,
        }));

        result.valores = result.valores.concat(valores);
        return accumulator;
      },      []);

    return {
      contratual: {
        id: taxaContratual.id,
        adesao: taxaContratual.adesao,
        antecipacao: taxaContratual.antecipacao,
        maximoParcelas: taxaContratual.maximoParcelas,
      },
      debito: debitos,
      administrativas: taxasAdministrativas,
    };
  });
};

export default commercialConditions;
