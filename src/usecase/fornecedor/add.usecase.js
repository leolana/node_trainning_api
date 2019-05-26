const tiposPessoa = require('../../service/participante/personType.enum');
// eslint-disable-next-line max-len
const indicacaoStatus = require('../../service/participante/nominationStatus.enum');
const vinculoStatus = require('../../service/vinculo/status.enum');
const history = require('../../service/participante/saveHistory.service');
const emailTemplates = require('../../service/mailer/emailTemplates.enum');
const roles = require('../../service/auth/roles.enum');
// eslint-disable-next-line max-len
const validateRange = require('../../service/participante/validateRange.service');
const saveFiles = require('../../service/file/saveFiles.service');
const formatTax = require('../../service/participante/formatTax.service');
// eslint-disable-next-line max-len
const formatDocumento = require('../../service/participante/formatDocumento.service');

// TODO: Permitir configuração desse valor
const { defaultApprovingDays } = require('../../service/vinculo/config');

module.exports = (
  db,
  siscofWrapper,
  auth,
  mailer,
  mailerSettings,
  fileStorage
) => (data, files, user) => {
  let existingId = null;

  const saveHistory = history(db);

  const validate = data => new Promise((resolve, reject) => {
    if (!data.documento) reject(String('documento-nao-informado'));

    db.entities.participante
      .findOne({
        where: { documento: data.documento },
      })
      .then((result) => {
        if (result) reject(String('fornecedor-ja-cadastrado'));

        const rangeValid = validateRange(data.taxas.cessao);
        if (rangeValid) {
          reject(String(rangeValid));
        }

        resolve();
      });
  });

  const uploadFiles = files => Promise.all(
    files.map(file => fileStorage.upload(file.name, file.content))
  );

  function getExistingId(data) {
    return db.entities.participanteExistenteSiscof
      .findOne(
        { where: { documento: data.documento } }
      );
  }

  function createParticipanteFornecedor(participant, transaction) {
    return db.entities.participanteFornecedor
      .create(
        { participanteId: participant.id },
        { transaction },
      )
      .then(() => participant);
  }

  function createParticipant(transaction) {
    return db.entities.participante.create(data, {
      include: [
        {
          model: db.entities.participanteContato,
          as: 'contatos',
        },
        {
          model: db.entities.participanteDomicilioBancario,
          as: 'domiciliosBancarios',
        },
        {
          model: db.entities.participanteTaxa,
          as: 'taxas',
        },
      ],
      returning: true,
      transaction,
    });
  }

  const register = (data, user, participantId, files, t) => {
    data.usuario = user;
    data.tipoPessoa = tiposPessoa.juridica;
    data.contatos = [data.contato];

    data.arquivos = {
      extratosBancarios: files.map(f => f.key),
    };

    if (participantId) {
      data.id = participantId;
      existingId = participantId;
    }

    data.taxas = formatTax(data.taxas, user);

    return createParticipant(t)
      .then(participant => createParticipanteFornecedor(participant, t));
  };

  const findCity = cityId => db.entities.cidade.findOne({
    where: { id: cityId },
  });

  const getNominationsSyncSiscof = (participant, city) => {
    if (!city || !city.nome || !city.estado) {
      throw String('invalid-city-data');
    }

    participant.cidade = city.nome;
    participant.estado = city.estado;
    const promises = [
      db.entities.participanteIndicacao.findAll({
        where: { documento: participant.documento },
      }),
    ];
    if (existingId == null) {
      promises.push(
        siscofWrapper.incluirParticipante(participant, false)
      );
    }
    return Promise.all(promises)
      .then(results => results[0]);
  };

  const inviteUser = (data, user, participantId, transaction) => auth
    .inviteUser({
      nome: data.contato.nome,
      email: data.contato.email,
      celular: data.contato.celular,
      roles: [roles.fcAdministrador],
      convidadoPor: user,
      participante: participantId,
    }, transaction);

  const notifyRegsitry = (supplier, participantId) => {
    const contatoInclude = () => ({
      model: db.entities.participanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: db.entities.participante,
      as: 'participante',
      attributes: ['id', 'nome', 'documento', 'razaoSocial'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return db.entities.participanteEstabelecimento
      .findOne({
        where: { participanteId: participantId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      })
      .then((estabelecimento) => {
        mailer.enviar({
          templateName: emailTemplates.INDICACAO_FORNECEDOR_ACEITA,
          destinatary: estabelecimento.participante.contatos[0].email,
          substitutions: {
            estabelecimento: estabelecimento.participante.nome,
            fornecedor: supplier.nome,
            documento: formatDocumento(supplier.documento),
            linkFornecedoresCadastrados:
              `${mailerSettings.baseUrl}/fornecedor/gerenciamento/cadastrados`,
          },
        });
        mailer.enviar({
          templateName: emailTemplates.INDICACAO_FORNECEDOR_CADASTRADO_VINCULO,
          destinatary: supplier.contatos[0].email,
          substitutions: {
            fornecedor: supplier.nome,
            estabelecimento: estabelecimento.participante.nome,
            documento: formatDocumento(estabelecimento.participante.documento),
            linkSolicitarCessao: `${mailerSettings.baseUrl}/
            fornecedor/estabelecimentos`,
          },
        });
      });
  };

  const createLinks = (nominations, supplierId, supplier, transaction) => {
    const promises = [];
    nominations.forEach((nomination) => {
      promises.push(
        nomination.update(
          { status: indicacaoStatus.aprovado },
          { transaction }
        )
      );
      promises.push(db.entities.participanteVinculo.create({
        participanteEstabelecimentoId: nomination.participanteId,
        participanteFornecedorId: supplierId,
        usuario: nomination.usuario,
        exibeValorDisponivel: true,
        diasAprovacao: defaultApprovingDays,
        estabelecimentoSolicitouVinculo: true,
        status: vinculoStatus.aprovado,
      }, { transaction }));
      promises.push(
        siscofWrapper.incluirExcluirCessionarioEC(
          supplierId,
          nomination.participanteId,
          vinculoStatus.aprovado
        )
      );
      promises.push(
        notifyRegsitry(supplier, nomination.participanteId)
      );
    });

    return Promise.all(promises);
  };

  return validate(data)
    .then(() => saveFiles('fornecedor', files, data.documento))
    .then(uploadFiles)
    .then(uploadedFiles => (getExistingId(data)
      .then(participantId => db.transaction(
        t => register(data, user, participantId, uploadedFiles, t)
          .then(participant => (findCity(participant.cidadeId)
            .then(city => getNominationsSyncSiscof(participant, city))
            .then(nominations => Promise.all([
              saveHistory(participant, t),
              inviteUser(data, user, participant.id, t),
              createLinks(nominations, participant.id, data, t),
            ]))
          ))
      ))
    ));
};
