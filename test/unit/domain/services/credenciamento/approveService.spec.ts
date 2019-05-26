import approveService from '../../../../../src/domain/services/credenciamento/approveService';
import credenciamentoStatusEnum from '../../../../../src/domain/entities/credenciamentoStatusEnum';

describe('Domain :: Services :: Credenciamento :: Approve', () => {
  const db: any = {
    entities: {
      participanteExistenteSiscof: {
        findOne: () => Promise.resolve({})
      },
      participanteDomicilioBancario: {
        destroy: () => null,
        bulkCreate: (...args: any[]) => Promise.resolve(args)
      },
      participanteContato: {
        destroy: () => null,
        bulkCreate: (...args: any[]) => Promise.resolve(args)
      },
      participanteSocio: {
        destroy: () => null,
        bulkCreate: (...args: any[]) => Promise.resolve(args)
      },
      participante: {
        create: () => Promise.resolve({}),
        update: () => Promise.resolve([, [{ credenciamento: { taxaContratual: 1 } }]])
      },
      participanteEstabelecimento: {
        create: () => Promise.resolve({})
      },
      credenciamentoAprovacao: {
        create: () => Promise.resolve({})
      }
    }
  };

  const siscofWrapper: any = {
    incluirParticipante: () => Promise.resolve({})
  };

  const services: any = {
    inactivateDuplicatesService: () => Promise.resolve()
  };

  const approve = approveService(db, siscofWrapper, services);

  test('Approve missing credenciamento', () => {
    const action = approve(null, null, false, null);
    return expect(action).rejects.toThrowError('credenciamento-nao-localizado');
  });

  test('Approve wrong status', () => {
    const credenciamento: any = {
      status: credenciamentoStatusEnum.pendente,
    };

    const action = approve(credenciamento, null, false, null);
    return expect(action).rejects.toThrowError('credenciamento-status-invalido');
  });

  test('Approve credenciamento', () => {
    const credenciamento: any = {
      status: credenciamentoStatusEnum.emAnalise,
      dataValues: { id: 1, taxaContratual: {} },
      contato: { dataValues: { id: 1 } },
      socios: [],
      domiciliosBancarios: [],
      save: () => Promise.resolve(credenciamento),
    };

    const newParticipant = approve(credenciamento, null, false, null);
    return expect(newParticipant).resolves.toBeTruthy();
  });

});
