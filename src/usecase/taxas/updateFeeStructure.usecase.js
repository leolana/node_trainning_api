const addTaxasBandeiras = require('./addFeeFlags.usecase');
const addTaxasFaturamentos = require('./addFeeRevenues.usecase');

module.exports = db => (taxa, json, usuario) => {
  const $addTaxasFaturamentos = addTaxasFaturamentos(db);
  const actions = [];

  // procura se existem novas bandeiras
  const novasBandeiras = json.bandeiras.filter(_taxaBandeira => {
    const existe = taxa.bandeiras.some(
      taxaBandeira => taxaBandeira.bandeiraId === +_taxaBandeira.idBandeira,
    );
    return !existe;
  });

  // e as cria se achar
  if (novasBandeiras.length) {
    actions.push(addTaxasBandeiras(db)(taxa.id, novasBandeiras, usuario));
  }

  // atualiza as bandeiras já existentes
  taxa.bandeiras.forEach(taxaBandeira => {
    const _taxaBandeira = json.bandeiras.find(
      _taxaBandeira => taxaBandeira.bandeiraId === +_taxaBandeira.idBandeira,
    );

    taxaBandeira.taxaDebito = _taxaBandeira.taxaDebito;
    taxaBandeira.usuario = usuario;
    actions.push(taxaBandeira.save());

    // procura se existem novos faturamentos
    const novosFaturamentos = _taxaBandeira.faturamentos.filter(
      _taxaFaturamento => {
        const existe = taxaBandeira.faturamentos.some(taxaFaturamento => {
          const _faturamentoId = +_taxaFaturamento.idFaturamento;
          return taxaFaturamento.faturamentoCartaoId === _faturamentoId;
        });
        return !existe;
      },
    );

    // e os cria se achar
    if (novosFaturamentos.length) {
      actions.push(
        $addTaxasFaturamentos(taxaBandeira.id, novosFaturamentos, usuario),
      );
    }

    // atualiza os faturamentos já existentes
    taxaBandeira.faturamentos.forEach(taxaFaturamento => {
      const _taxaFaturamento = _taxaBandeira.faturamentos.find(
        _taxaFaturamento => {
          const _faturamentoId = +_taxaFaturamento.idFaturamento;
          return _faturamentoId === taxaFaturamento.faturamentoCartaoId;
        },
      );

      taxaFaturamento.coeficiente = _taxaFaturamento.coeficiente;
      taxaFaturamento.usuario = usuario;
      actions.push(taxaFaturamento.save());
    });
  });

  // atualiza prazos e taxasAdministrativas
  json.prazos.forEach(_prazo => {
    json.prazos33.forEach(_bandeira => {
      _bandeira.ranges.forEach(_range => {
        const prazo = taxa.prazos.find(prazo => {
          const matchPrazo = prazo.prazo === +_prazo.prazo;
          const matchMinimo = prazo.minimo === +_range.minimo;
          const matchMaximo = prazo.maximo === +_range.maximo;

          return matchPrazo && matchMinimo && matchMaximo;
        });

        if (!prazo) throw String('taxa-prazo-no-longer-exists');

        prazo.coeficiente = _prazo.coeficiente;
        prazo.usuario = usuario;
        actions.push(prazo.save());

        const taxaAdministrativa = prazo.taxasAdministrativas.find(
          taxaAdministrativa => {
            const _bandeiraId = +_bandeira.idBandeira;
            return taxaAdministrativa.bandeiraId === _bandeiraId;
          },
        );

        if (!taxaAdministrativa)
          throw String('taxa-administrativa-no-longer-exists');

        taxaAdministrativa.valorBase = _range.taxa;
        taxaAdministrativa.usuario = usuario;
        actions.push(taxaAdministrativa.save());
      });
    });
  });

  return Promise.all(actions);
};
