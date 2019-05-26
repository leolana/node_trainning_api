import addFeeFlags from './addFeeFlags';
import addFeeRevenues from './addFeeRevenues';

const updateFeeStructure = db => (taxa, json, usuario) => {
  const $addFeeRevenues = addFeeRevenues(db);
  const actions = [];

  // procura se existem novas bandeiras
  const novasBandeiras = json.bandeiras.filter((bandeiras) => {
    const existe = taxa.bandeiras.some(
      taxaBandeira => taxaBandeira.bandeiraId === +bandeiras.idBandeira,
    );
    return !existe;
  });

  // e as cria se achar
  if (novasBandeiras.length) {
    actions.push(addFeeFlags(db)(taxa.id, novasBandeiras, usuario));
  }

  // atualiza as bandeiras já existentes
  taxa.bandeiras.forEach((taxaBandeira) => {
    const bandeiras = json.bandeiras.find(
      bandeira => taxaBandeira.bandeiraId === +bandeira.idBandeira,
    );

    taxaBandeira.taxaDebito = bandeiras.taxaDebito;
    taxaBandeira.usuario = usuario;
    actions.push(taxaBandeira.save());

    // procura se existem novos faturamentos
    const novosFaturamentos = bandeiras.faturamentos.filter(
      (faturamento) => {
        const existe = taxaBandeira.faturamentos.some((taxaFaturamento) => {
          const id = +faturamento.idFaturamento;
          return (taxaFaturamento).faturamentoCartaoId === id;
        });
        return !existe;
      },
    );

    // e os cria se achar
    if (novosFaturamentos.length) {
      actions.push(
        $addFeeRevenues(taxaBandeira.id, novosFaturamentos, usuario),
      );
    }

    // atualiza os faturamentos já existentes
    taxaBandeira.faturamentos.forEach((taxaFaturamento) => {
      const faturamento = bandeiras.faturamentos.find(
        (bandeiraTaxaFaturamento: any) => {
          const id = +bandeiraTaxaFaturamento.idFaturamento;
          return id === taxaFaturamento.faturamentoCartaoId;
        },
      );

      taxaFaturamento.coeficiente = faturamento.coeficiente;
      taxaFaturamento.usuario = usuario;
      actions.push(taxaFaturamento.save());
    });
  });

  // atualiza prazos e taxasAdministrativas
  json.prazos.forEach((jsonPrazo) => {
    json.prazos33.forEach((bandeira) => {
      bandeira.ranges.forEach((range) => {
        const prazo = taxa.prazos.find((item) => {
          const matchPrazo = item.prazo === +jsonPrazo.prazo;
          const matchMinimo = item.minimo === +range.minimo;
          const matchMaximo = item.maximo === +range.maximo;

          return matchPrazo && matchMinimo && matchMaximo;
        });

        if (!prazo) throw new Error('taxa-prazo-no-longer-exists');

        prazo.coeficiente = jsonPrazo.coeficiente;
        prazo.usuario = usuario;
        actions.push(prazo.save());

        const taxaAdministrativa = prazo.taxasAdministrativas.find(
          (item) => {
            const bandeiraId = +bandeira.idBandeira;
            return item.bandeiraId === bandeiraId;
          },
        );

        if (!taxaAdministrativa) {
          throw new Error('taxa-administrativa-no-longer-exists');
        }

        taxaAdministrativa.valorBase = range.taxa;
        taxaAdministrativa.usuario = usuario;
        actions.push(taxaAdministrativa.save());
      });
    });
  });

  return Promise.all(actions);
};

export default updateFeeStructure;
