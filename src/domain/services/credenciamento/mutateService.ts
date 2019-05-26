import { DateTime } from 'luxon';

import mapFiles from '../file/mapFiles';
import applyFiles from './applyFiles';
import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';
import personTypeEnum from '../participante/personTypeEnum';
import { InvalidSentDataException, InvalidTypeOfPersonException, InvalidPartnerBirthDateException } from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Sequelize } from 'sequelize-database';

const mutateService = (db: Sequelize, fileStorage) => (
  data,
  status,
  files,
  documento,
  user,
  unchangedFiles = null,
  transaction = null
) => {
  const validate = () => new Promise((resolve, reject) => {
    if (!Object.values(personTypeEnum).some(t => t === data.tipoPessoa)) {
      reject(new InvalidTypeOfPersonException());
    }

    const dataNascimentoAbertura = DateTime
      .fromISO(data.dadosCadastrais.aberturaNascimento)
      .toJSDate();
    const today = DateTime.local().toJSDate();

    if (dataNascimentoAbertura > today) {
      reject(new InvalidSentDataException());
    }

    const { socios } = data.dadosCadastrais;

    if (socios) {
      const invalidDates = socios
        .filter((socio) => {
          const dataAberturaNascimentoSocio = DateTime
            .fromISO(socio.aberturaNascimento)
            .toJSDate();
          return dataAberturaNascimentoSocio > today;
        });
      if (invalidDates.length) {
        reject(new InvalidPartnerBirthDateException());
      }
    }

    resolve();
  });

  const uploadFiles = arquivos => Promise.all(
    arquivos.map(file => fileStorage.upload(file.name, file.content))
  );

  const assembleData = (uploadedFiles) => {
    const domicilios: any[] = data.dadosCadastrais.domiciliosBancarios.map(t => ({
      bandeiraId: +t.bandeira.id,
      bancoId: t.banco.id,
      bancoNome: t.banco.text,
      agencia: t.agencia,
      conta: t.conta,
      digito: t.digito,
      arquivo: t.arquivo || null,
      existing: t.existing,
      newFile: t.newFile
    })).sort((a, b) => {
      if (a.bandeiraId < b.bandeiraId) return -1;
      if (a.bandeiraId > b.bandeiraId) return 1;

      return 0;
    });

    const credenciamento: any = {
      documento,
      status,
      nome: data.dadosCadastrais.nome,
      tipoPessoa: +data.tipoPessoa,
      ramoAtividadeCodigo: +data.dadosCadastrais.ramoAtividade,
      aberturaNascimento:
        DateTime.fromISO(data.dadosCadastrais.aberturaNascimento).toISODate(),
      telefone: data.dadosCadastrais.telefone,
      cep: data.dadosCadastrais.cep,
      logradouro: data.dadosCadastrais.logradouro,
      complemento: data.dadosCadastrais.complemento,
      numero: data.dadosCadastrais.numero,
      bairro: data.dadosCadastrais.bairro,
      cidadeId: +data.dadosCadastrais.cidade,
      taxaAdesao: data.condicaoComercial.taxaAdesao,
      faturamentoCartaoId:
        +data.dadosCadastrais.informacoesFinanceiras.faturamentoAnual.id,
      ticketMedioId:
        +data.dadosCadastrais.informacoesFinanceiras.ticketMedio.id,
      ecommerce: data.captura.url,
      usuario: user,
      domiciliosBancarios: domicilios,
      capturas: data.captura.capturas.map(t => ({
        capturaId: +t.id,
        quantidade: +t.quantidade,
        valor: t.valor
      })),
      instalacao: { cidadeId: data.instalacao.cidade, ...data.instalacao },
      contato: {
        nome: data.dadosCadastrais.contato.nomeContato,
        email: data.dadosCadastrais.contato.emailContato,
        telefone: data.dadosCadastrais.contato.telefoneContato,
        celular: data.dadosCadastrais.contato.celularContato,
      },
      taxaContratualId: +data.condicaoComercial.taxaContratual,
      taxasAdministrativas:
        data.condicaoComercial.taxasAdministrativas.map(t => ({
          taxaAdministrativaId: t.id,
          valor: t.valor,
        })),
      taxasDebito:
        data.condicaoComercial.taxasDebito.map(t => ({
          taxaBandeiraId: t.id,
          valor: t.valor,
        })),
      socios: (data.dadosCadastrais.socios || []).map((socio) => {
        delete socio.id;
        return socio;
      }),
      historicoAprovacao: [{
        status: credenciamentoStatusEnum.pendente,
        usuario: user,
        observacao: '',
      }],
      arquivos: {
        analises: [],
      }
    };

    credenciamento.socios.forEach(s => delete s.id);

    if (data.credenciamento) {
      credenciamento.createdAt = data.credenciamento.createdAt;
    }

    if (+credenciamento.tipoPessoa === personTypeEnum.juridica) {
      credenciamento.razaoSocial = data.dadosCadastrais.razaoSocial;
      credenciamento.inscricaoEstadual = data.dadosCadastrais.inscricaoEstadual;
      credenciamento.inscricaoMunicipal = data.dadosCadastrais.inscricaoMunicipal;
    }

    applyFiles(uploadedFiles, credenciamento);

    const mapaDomicilios: { [key: string]: any[] } = {};

    const getKey = (i: number) => {
      const d = credenciamento.domiciliosBancarios[i];
      return `${d.bancoId}${d.agencia}${d.conta}${d.digito}`;
    };

    const reportFiles = uploadedFiles.filter(f => f.key.indexOf('extratosBancarios') >= 0);
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
        d.arquivo = reportFiles[i].key;
      });
    });

    credenciamento.domiciliosBancarios = [].concat.apply(unchanged, sorted);

    if (unchangedFiles) {
      if (unchangedFiles.analises) {
        credenciamento.arquivos.analises = unchangedFiles.analises;
      }

      unchangedFiles.forEach((f) => {
        if (f.id.startsWith('extrato')) {
          // ignorar
        } else if (!(
          f.id.startsWith('analise')
          || f.id in credenciamento.arquivos
        )) {
          credenciamento.arquivos[f.id] = f.arquivo;
        }
      });
    }

    return credenciamento;
  };

  const persistData = (credenciamento) => {
    const includes = [
      {
        model: db.entities.credenciamentoDomicilioBancario,
        as: 'domiciliosBancarios',
      },
      {
        model: db.entities.credenciamentoCaptura,
        as: 'capturas',
      },
      {
        model: db.entities.credenciamentoInstalacao,
        as: 'instalacao',
      },
      {
        model: db.entities.credenciamentoTaxaAdministrativa,
        as: 'taxasAdministrativas',
      },
      {
        model: db.entities.credenciamentoTaxaDebito,
        as: 'taxasDebito',
      },
      {
        model: db.entities.credenciamentoAprovacao,
        as: 'historicoAprovacao',
      },
      {
        model: db.entities.credenciamentoContato,
        as: 'contato',
      },
    ];

    if (+credenciamento.tipoPessoa === personTypeEnum.juridica) {
      includes.push({ model: db.entities.credenciamentoSocio, as: 'socios' });
    }

    const create = (t: any) => db.entities.credenciamento.create(
      credenciamento,
      {
        transaction: t,
        include: includes,
        returning: true,
      },
    );

    if (transaction) {
      return create(transaction);
    }

    return db.transaction(create);
  };

  return validate()
    .then(() => mapFiles(files, documento, 'credenciamento'))
    .then(uploadFiles)
    .then(assembleData)
    .then(persistData);
};

export default mutateService;
