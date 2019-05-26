import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';
import personTypeEnum from '../participante/personTypeEnum';
import rateTypeEnum from '../participante/rateTypeEnum';
import { Sequelize } from 'sequelize-database';
import { SiscofWrapper } from '../../../infra/siscof';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { CredenciamentoServices } from './index';

const approveService = (
  db: Sequelize,
  siscofWrapper: SiscofWrapper,
  services: CredenciamentoServices
) => (credenciamento: any, user: string, participanteEdicao: any, transaction: any) => {
  let participante = null;

  const validate = () => {
    if (!credenciamento) {
      throw new Exceptions.AccreditationNotFoundException();
    }

    if (participanteEdicao) {
      if (credenciamento.status !== credenciamentoStatusEnum.aprovado) {
        throw new Exceptions.InvalidAccreditationStatusException();
      }
    } else {
      if (credenciamento.status !== credenciamentoStatusEnum.emAnalise) {
        throw new Exceptions.InvalidAccreditationStatusException();
      }
    }

    credenciamento.status = credenciamentoStatusEnum.aprovado;
  };

  const setDataParticipante = () => {
    participante = {
      ...credenciamento.dataValues,
      usuario: user,
    };
    delete participante.id;
    delete participante.createdAt;
    delete participante.updatedAt;

    participante.contatos = [credenciamento.contato.dataValues];
    delete participante.contatos[0].id;

    participante.socios = credenciamento.socios.map((socio: any) => {
      delete socio.dataValues.id;
      return socio.dataValues;
    });

    participante.domiciliosBancarios = credenciamento.domiciliosBancarios.map((domicilioBancario: any) => {
      delete domicilioBancario.dataValues.id;
      return domicilioBancario.dataValues;
    });

    participante.taxas = [{
      valorInicio: null,
      valorFim: null,
      taxa: participante.taxaContratual.antecipacao,
      usuarioCriacao: user,
      participanteTaxaTipo: rateTypeEnum.antecipacao,
    }];
  };

  const checkParticipanteId = () => {
    if (participanteEdicao) {
      return participanteEdicao.id;
    }

    const where = {
      documento: participante.documento
    };

    return db.entities.participanteExistenteSiscof
      .findOne({ where })
      .then(found => found && found.participanteId);
  };

  const createParticipante = () => {
    const includes = [
      {
        model: db.entities.participanteDomicilioBancario,
        as: 'domiciliosBancarios',
      },
      {
        model: db.entities.participanteContato,
        as: 'contatos',
      },
      {
        model: db.entities.participanteTaxa,
        as: 'taxas',
      }
    ];

    if (+participante.tipoPessoa === personTypeEnum.juridica) {
      includes.push({
        model: db.entities.participanteSocio,
        as: 'socios'
      });
    }

    return db.entities.participante.create(participante, {
      transaction,
      include: includes,
    });
  };

  const updateParticipante = () => {
    participante.contatos.forEach((contato: any) => {
      contato.participanteId = participante.id;
    });

    participante.socios.forEach((socio: any) => {
      socio.participanteId = participante.id;
    });

    participante.domiciliosBancarios.forEach((domicilioBancario: any) => {
      domicilioBancario.participanteId = participante.id;
    });

    const promises = [
      db.entities.participante.update(
        participante,
        {
          transaction,
          where: { id: participante.id },
          returning: true,
        }
      ).then(result => Object.assign(result[1][0], participante)),
      db.entities.participanteContato.destroy({
        transaction,
        where: { participanteId: participante.id },
      }),
      db.entities.participanteSocio.destroy({
        transaction,
        where: { participanteId: participante.id },
      }),
      db.entities.participanteDomicilioBancario.destroy({
        transaction,
        where: { participanteId: participante.id },
      }),
      db.entities.participanteContato.bulkCreate(
        participante.contatos,
        { transaction },
      ),
      db.entities.participanteDomicilioBancario.bulkCreate(
        participante.domiciliosBancarios,
        { transaction },
      )
    ];

    if (+participante.tipoPessoa === personTypeEnum.juridica) {
      promises.push(
        db.entities.participanteSocio.bulkCreate(
          participante.socios,
          { transaction },
        )
      );
    }

    return promises;
  };

  const saveParticipante = (existingId: number) => {
    if (existingId) {
      participante.id = existingId;
    }

    const promises: any[] = [];

    if (participanteEdicao) {
      promises.push(...updateParticipante());
    } else {
      promises.push(createParticipante());
    }

    const aprovacao = {
      credenciamentoId: credenciamento.id,
      status: credenciamentoStatusEnum.aprovado,
      usuario: user,
      observacao: participanteEdicao ? 'editado' : '',
    };

    promises.push(
      db.entities.credenciamentoAprovacao.create(aprovacao, { transaction })
    );

    return Promise.all(promises).then(([newParticipant]) => newParticipant);
  };

  const saveCredenciamento = (newParticipant) => {
    credenciamento.participanteId = newParticipant.id;
    newParticipant.credenciamento = credenciamento;

    return credenciamento.save({ transaction }).then(() => newParticipant);
  };

  const createEstablishment = (newParticipant: any) => {
    if (participanteEdicao) {
      newParticipant.isAlteracao = true;
      return Promise.resolve(newParticipant);
    }

    return db.entities.participanteEstabelecimento.create(
      { participanteId: newParticipant.id },
      { transaction }
    ).then(() => newParticipant);
  };

  const inactivateDuplicates = (newParticipant: any) => {
    return services
      .inactivateDuplicatesService(credenciamento.id, credenciamento.documento, transaction)
      .then(() => newParticipant);
  };

  const syncSiscof = (newParticipant: any) => {
    // Valor necessário para envio ao siscof
    newParticipant.taxaContratual = newParticipant.credenciamento.taxaContratual;

    return siscofWrapper
      .incluirParticipante(newParticipant, true)
      .then(() => newParticipant);
  };

  return Promise.resolve()
    .then(validate)
    .then(setDataParticipante)
    .then(checkParticipanteId)
    .then(saveParticipante)
    .then(saveCredenciamento)
    .then(createEstablishment)
    .then(inactivateDuplicates)
    .then(syncSiscof);
};

export default approveService;
