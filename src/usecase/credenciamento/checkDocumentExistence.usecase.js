/* eslint-disable max-len */
const statusCredenciamento = require('../../service/credenciamento/accreditationStatus.enum');
const statusDocumento = require('./checkDocumentExistenceStatus.enum');
const canalDeEntrada = require('../../service/participante/nominationSource.enum');

module.exports = db => (documento) => {
  const result = [];

  function checkCredenciamentos() {
    return db.entities.credenciamento.findAll({
      where: { documento },
      attributes: ['status', 'participanteId'],
    }).then((credenciamentos) => {
      const mapping = {
        [statusCredenciamento.aprovado]: statusDocumento.credenciamentoAprovado,
        [statusCredenciamento.emAnalise]: statusDocumento.credenciamentoEmAnalise,
        [statusCredenciamento.pendente]: statusDocumento.credenciamentoPendente,
        [statusCredenciamento.reprovado]: statusDocumento.credenciamentoRecusado,
      };

      result.push(
        ...credenciamentos.map(c => ({
          participanteId: c.participanteId,
          statusDocumento: mapping[c.status],
          from: 'credenciamentos',
        }))
      );
    });
  }

  function checkEstabelecimentos() {
    return db.entities.participanteEstabelecimento.findAll({
      attributes: [],
      include: [{
        model: db.entities.participante,
        as: 'participante',
        where: { documento },
        attributes: ['ativo', 'id'],
      }],
    }).then((estabelecimentos) => {
      if (!estabelecimentos.length) {
        return;
      }

      result.push(
        ...estabelecimentos.map(e => ({
          participanteId: e.participante.id,
          statusDocumento: e.participante.ativo
            ? statusDocumento.estabelecimentoAtivo
            : statusDocumento.estabelecimentoInativo,
          from: 'estabelecimentos',
        }))
      );
    });
  }

  function checkFornecedores() {
    return db.entities.participanteFornecedor.findAll({
      attributes: [],
      include: [{
        model: db.entities.participante,
        as: 'participante',
        where: { documento },
        attributes: ['ativo', 'id'],
      }],
    }).then((fornecedores) => {
      if (!fornecedores.length) {
        return;
      }

      result.push(
        ...fornecedores.map(f => ({
          participanteId: f.participante.id,
          statusDocumento: f.participante.ativo
            ? statusDocumento.fornecedorAtivo
            : statusDocumento.fornecedorInativo,
          from: 'fornecedores',
        }))
      );
    });
  }

  function checkParticipantes() {
    if (result.length) {
      return 'ja foi credenciado';
    }

    return Promise.all([
      checkEstabelecimentos(),
      checkFornecedores(),
    ]).then(() => {
      if (result.length) {
        return 'estabelecimento/fornecedor ja cadastrado';
      }

      return db.entities.participante.findAll({
        where: { documento },
        attributes: ['ativo', 'id'],
      }).then((participantes) => {
        result.push(
          ...participantes.map(p => ({
            participanteId: p.id,
            statusDocumento: p.ativo
              ? statusDocumento.participanteAtivo
              : statusDocumento.participanteInativo,
            from: 'participantes',
          }))
        );
      });
    });
  }

  function checkPreCadastros() {
    return db.entities.credenciamentoProposta.count({
      where: { documento },
    }).then((prePropostas) => {
      if (prePropostas) {
        result.push({
          statusDocumento: statusDocumento.credenciamentoProposta,
          from: 'pré-cadastros',
        });
      }
    });
  }

  function checkIndicacoes() {
    return db.entities.participanteIndicacao.findAll({
      where: { documento },
      attributes: ['canalEntrada'],
    }).then((indicacoes) => {
      const mapping = {
        [canalDeEntrada.indicacaoPorEc]: statusDocumento.indicadoPorEstabelecimento,
        [canalDeEntrada.indicacaoPorFornecedor]: statusDocumento.indicadoPorFornecedor,
      };

      result.push(
        ...indicacoes
          .map(i => i.canalEntrada)
          .filter((x, i, a) => a.indexOf(x) === a.lastIndexOf(x))
          .map(x => ({
            statusDocumento: mapping[x],
            from: 'indicações',
          }))
      );
    });
  }

  function checkEntradas() {
    if (result.length) {
      return 'documento ja cadastrado';
    }

    return Promise.all([
      checkPreCadastros(),
      checkIndicacoes(),
    ]);
  }

  return checkCredenciamentos()
    .then(checkParticipantes)
    .then(checkEntradas)
    .then(() => result);
};
