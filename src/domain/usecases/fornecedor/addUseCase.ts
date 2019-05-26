import personTypeEnum from '../../services/participante/personTypeEnum';
import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import saveHistory from '../../services/participante/saveHistory';
import { rolesEnum } from '../../services/auth/rolesEnum';
import mapFiles from '../../services/file/mapFiles';
import validateRange from '../../services/participante/validateRange';
import formatTax from '../../services/participante/formatTax';
import formatDocumento from '../../services/participante/formatDocumento';
import { vinculoConfig } from '../../services/vinculo/vinculoConfig';

const addUseCase = (
  db,
  siscofWrapper,
  auth,
  mailer,
  mailerSettings,
  fileStorage
) => (data, files, user) => {
  let existingId = null;

  const save = saveHistory(db);

  const validate = (fornecedor: any) => new Promise((resolve, reject) => {
    if (!fornecedor.documento) reject('documento-nao-informado');

    db.entities.participante
      .findOne({
        where: { documento: fornecedor.documento },
      })
      .then((result) => {
        if (result) reject('fornecedor-ja-cadastrado');

        const rangeValid = validateRange(data.taxas.cessao);
        if (rangeValid) {
          reject(rangeValid);
        }

        resolve();
      });
  });

  const uploadFiles = (arquivos: any) => Promise.all(
    arquivos.map(file => fileStorage.upload(file.name, file.content))
  );

  const getExistingId = (fornecedor: any) => db.entities.participanteExistenteSiscof
    .findOne(
      { where: { documento: fornecedor.documento } }
    );
  const createParticipanteFornecedor = (participant, transaction) => {
    return db.entities.participanteFornecedor
      .create(
        { participanteId: participant.id },
        { transaction },
      )
      .then(() => participant);
  };

  const createParticipant = (transaction) => {
    return db.entities.participante.create(data, {
      transaction,
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
    });
  };

  const register = (fornecedor, usuario, participantId, arquivos, transaction) => {
    fornecedor.usuario = usuario;
    fornecedor.tipoPessoa = personTypeEnum.juridica;
    fornecedor.contatos = [fornecedor.contato];

    if (participantId) {
      fornecedor.id = participantId;
      existingId = participantId;
    }

    fornecedor.taxas = formatTax(fornecedor.taxas, usuario);

    const domicilios = fornecedor.domiciliosBancarios.sort((a, b) => {
      if (a.bandeiraId < b.bandeiraId) return -1;
      if (a.bandeiraId > b.bandeiraId) return 1;

      return 0;
    });

    const mapaDomicilios: { [key: string]: any[] } = {};

    const getKey = (i: number) => {
      const d = domicilios[i];
      return `${d.bancoId}${d.agencia}${d.conta}${d.digito}`;
    };

    const unchanged = [];

    // Mapear arquivos modificados em seus respectivos domicílios
    domicilios.forEach((d, i) => {
      if (!d.newFile) {
        unchanged.push(d);
        return;
      }

      const compare = getKey(i);

      const current = mapaDomicilios[compare] || [];

      current.push(d);

      mapaDomicilios[compare] = current;
    });

    const sorted = Object.values(mapaDomicilios).sort((a, b) => {
      if (a[0].bandeiraId < b[0].bandeiraId) return -1;
      if (a[0].bandeiraId > b[0].bandeiraId) return 1;
      return 0;
    });

    sorted.forEach((ds, i) => {
      ds.forEach((d) => {
        d.arquivo = arquivos[i].key;
      });
    });

    fornecedor.domiciliosBancarios = [].concat.apply(unchanged, sorted);

    return createParticipant(transaction)
      .then(participant => createParticipanteFornecedor(participant, transaction));
  };

  const findCity = cityId => db.entities.cidade.findOne({
    where: { id: cityId },
  });

  const getNominationsSyncSiscof = (participant, city) => {
    if (!city || !city.nome || !city.estado) {
      throw new Error('invalid-city-data');
    }

    participant.cidade = city.nome;
    participant.estado = city.estado;
    const promises = [
      db.entities.participanteIndicacao.findAll({
        where: { documento: participant.documento },
      }),
    ];
    if (existingId === null) {
      promises.push(
        siscofWrapper.incluirParticipante(participant, false)
      );
    }
    return Promise.all(promises)
      .then(results => results[0]);
  };

  const inviteUser = (fornecedor, usuario, participantId, transaction) => auth
    .inviteUser({
      nome: fornecedor.contato.nome,
      email: fornecedor.contato.email,
      celular: fornecedor.contato.celular,
      roles: [rolesEnum.fcAdministrador],
      convidadoPor: usuario,
      participante: participantId,
    },          transaction);

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
          templateName: mailer.emailTemplates.INDICACAO_FORNECEDOR_ACEITA,
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
          templateName: mailer.emailTemplates.INDICACAO_FORNECEDOR_CADASTRADO_VINCULO,
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
          { status: participanteVinculoStatus.aprovado },
          { transaction }
        )
      );
      promises.push(db.entities.participanteVinculo.create(
        {
          participanteEstabelecimentoId: nomination.participanteId,
          participanteFornecedorId: supplierId,
          usuario: nomination.usuario,
          exibeValorDisponivel: true,
          diasAprovacao: vinculoConfig.defaultApprovingDays,
          estabelecimentoSolicitouVinculo: true,
          status: participanteVinculoStatus.aprovado,
        },
        {
          transaction
        }));

      promises.push(
        siscofWrapper.incluirExcluirCessionarioEC(
          supplierId,
          nomination.participanteId,
          participanteVinculoStatus.aprovado
        )
      );
      promises.push(
        notifyRegsitry(supplier, nomination.participanteId)
      );
    });

    return Promise.all(promises);
  };

  return validate(data)
    .then(() => mapFiles(files, data.documento, 'fornecedor'))
    .then(uploadFiles)
    .then(uploadedFiles => (getExistingId(data)
      .then(participantId => db.transaction(
        t => register(data, user, participantId, uploadedFiles, t)
          .then(participant => (findCity(participant.cidadeId)
            .then(city => getNominationsSyncSiscof(participant, city))
            .then(nominations => Promise.all([
              save(participant, t),
              inviteUser(data, user, participant.id, t),
              createLinks(nominations, participant.id, data, t),
            ]))
          ))
      ))
    ));
};

export default addUseCase;
