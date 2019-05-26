// tslint:disable:no-magic-numbers
import validateFee from '../../services/taxas/validateFee';
import searchOverlaps from '../../services/taxas/searchOverlaps';

const findFee = db => (
  idTaxa,
  tipoPessoa,
  ramoAtividadeCodigo,
  inicio,
  fim,
  ignoreerror,
) => {
  // TODO: ignoreerror não deveria estar aqui, mas não é possível
  // colocar a lógica no front devido ao tratamento de erro do interceptor

  const where: any = {};

  const validate = () => {
    if (idTaxa) {
      where.id = idTaxa;
      return Promise.resolve(true);
    }

    where.tipoPessoa = tipoPessoa;
    where.ramoAtividadeCodigo = ramoAtividadeCodigo;
    where.inicio = inicio;
    where.fim = fim;
    return validateFee(where);
  };

  const getFee = () => {
    const action = db.entities.taxa.findOne({
      where,
      include: [
        {
          model: db.entities.ramoAtividade,
          as: 'ramoAtividade',
        },
        {
          model: db.entities.taxaBandeira,
          as: 'bandeiras',
          include: [
            {
              model: db.entities.taxaFaturamento,
              as: 'faturamentos',
            },
          ],
        },
        {
          model: db.entities.taxaPrazo,
          as: 'prazos',
          include: [
            {
              model: db.entities.taxaAdministrativa,
              as: 'taxasAdministrativas',
            },
          ],
          order: [['prazo', 'DESC']],
        },
      ],
    });
    return action;
  };

  const mapPrazos = (taxa) => {
    const prazos = taxa.prazos
      .map(prazo => ({
        prazo: prazo.prazo,
        coeficiente: prazo.prazo === 33 ? 0 : prazo.coeficiente,
      }))
      .filter((x, i, a) => a.findIndex(y => y.prazo === x.prazo) === i);

    return prazos;
  };

  const mapPrazos33 = (taxa) => {
    const rangesPrazo33 = taxa.prazos.filter(prazo => prazo.prazo === 33);
    if (!rangesPrazo33.length) throw new Error('taxa-sem-prazo-33');

    const bandeiras = [];
    rangesPrazo33.forEach((prazo) => {
      prazo.taxasAdministrativas.forEach((item) => {
        let bandeira = bandeiras.find(b => b.idBandeira === item.bandeiraId);
        if (!bandeira) {
          bandeira = {
            idBandeira: item.bandeiraId,
            ranges: [],
          };
          bandeiras.push(bandeira);
        }
        bandeira.ranges.push({
          minimo: prazo.minimo,
          maximo: prazo.maximo,
          taxa: item.valorBase,
        });
      });
    });
    return bandeiras;
  };

  const mapToViewModel = (taxa) => {
    if (!taxa) {
      if (ignoreerror) {
        return searchOverlaps(db)(where).then(taxas => ({
          overlaps: taxas,
        }));
      }
      throw new Error('taxa-not-found');
    }

    const viewModel = {
      id: taxa.id,
      idRamoAtividade: taxa.ramoAtividadeCodigo,
      ramoAtividade: (taxa.ramoAtividade || { descricao: 'Todos' }).descricao,
      idTipoPessoa: taxa.tipoPessoa,
      inicioVigencia: taxa.inicio,
      terminoVigencia: taxa.fim,
      bandeiras: taxa.bandeiras.map(txBandeira => ({
        idBandeira: txBandeira.bandeiraId,
        taxaDebito: txBandeira.taxaDebito,
        faturamentos: txBandeira.faturamentos.map(txFaturamento => ({
          idFaturamento: txFaturamento.faturamentoCartaoId,
          coeficiente: txFaturamento.coeficiente,
        })),
      })),
      prazos: mapPrazos(taxa),
      prazos33: mapPrazos33(taxa),
    };

    return viewModel;
  };

  return validate()
    .then(getFee)
    .then(mapToViewModel);
};

export default findFee;
