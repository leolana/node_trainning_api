import { DateTime } from 'luxon';

import mapFiles from '../../services/file/mapFiles';
import applyFiles from '../../services/credenciamento/applyFiles';
import personTypeEnum from '../../services/participante/personTypeEnum';
import {
  RegisterNotFoundException, AccreditationDocumentDiferentException,
  InvalidDebitRateException,
  InvalidAdministrativeRateException,
  InvalidPersonTypeException,
  InvalidOpeningDateException,
  InvalidPartnerBirthDateException,
} from '../../../interfaces/rest/exceptions/ApiExceptions';
import tiposPessoa from '../../../domain/entities/tiposPessoa';

// TODO: Verificar forma de refatorar para não ter repetição de código em comparação com a edição normal
const editAnalyze = (db, fileStorage) => (
  data,
  files,
  documento,
  user,
  unchangedFiles = null,
) => {
  const createCapturas = [];
  const createSocios = [];
  const deleteSocios = [];
  const deleteCapturas = [];

  const findExisting = id => db.entities.credenciamento.findOne({
    required: true,
    where: { id },
    include: [
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
        model: db.entities.credenciamentoContato,
        as: 'contato',
      },
      {
        model: db.entities.credenciamentoSocio,
        as: 'socios',
      },
    ],
  },
  );

  const validate = exisiting => new Promise((resolve, reject) => {
    if (!exisiting) throw new RegisterNotFoundException();

    if (exisiting.documento !== documento) {
      throw new AccreditationDocumentDiferentException();
    }

    if (!Object.values(personTypeEnum).some(t => t === data.tipoPessoa)) {
      throw new InvalidPersonTypeException();
    }

    const dataNascimentoAbertura = DateTime
      .fromISO(data.dadosCadastrais.aberturaNascimento)
      .toJSDate();
    const today = DateTime.local().toJSDate();

    if (dataNascimentoAbertura > today) {
      throw new InvalidOpeningDateException();
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
        throw new InvalidPartnerBirthDateException();
      }
      const oldSocios = {};
      const currentIdsSocios = {};

      if (exisiting.socios) {
        exisiting.socios.forEach((s) => {
          oldSocios[s.id] = s;
        });
      }

      socios.forEach((socio) => {
        if (!socio.id) {
          socio.credenciamentoId = data.dadosCadastrais.id;
          createSocios.push(socio);
        } else {
          currentIdsSocios[socio.id] = socio.id;
        }
      });

      Object.keys(oldSocios).forEach((oldId) => {
        if (!(oldId in currentIdsSocios)) {
          deleteSocios.push(oldSocios[oldId]);
        }
      });

    }

    if ((exisiting.arquivos.analises || []).length > 0) {
      unchangedFiles.analises = exisiting.arquivos.analises;
    }

    const debitRatesMap = {};
    const adminRatesMap = {};
    const oldCapturas = {};
    const currentIdsCapturas = {};

    if (exisiting.taxasDebito) {
      exisiting.taxasDebito.forEach((t) => {
        debitRatesMap[t.taxaBandeiraId] = t;
      });
    }

    if (exisiting.taxasAdministrativas) {
      exisiting.taxasAdministrativas.forEach((t) => {
        adminRatesMap[t.taxaAdministrativaId] = t;
      });
    }

    if (exisiting.capturas) {
      exisiting.capturas.forEach((c) => {
        oldCapturas[c.capturaId] = c;
      });
    }

    data.captura.capturas.forEach((c) => {
      currentIdsCapturas[c.id] = c.id;
      if (!(c.id in oldCapturas)) {
        createCapturas.push(c);
      }
    });

    Object.keys(oldCapturas).forEach((oldId) => {
      if (!(oldId in currentIdsCapturas)) {
        deleteCapturas.push(oldCapturas[oldId]);
      }
    });

    data.condicaoComercial.taxasDebito.forEach((t) => {
      if (t.id in debitRatesMap) {
        debitRatesMap[t.id].valor = t.valor;
      } else {
        throw new InvalidDebitRateException();
      }
    });

    data.condicaoComercial.taxasAdministrativas.forEach((t) => {
      if (t.id in adminRatesMap) {
        adminRatesMap[t.id].valor = t.valor;
      } else {
        throw new InvalidAdministrativeRateException();
      }
    });

    const debitRates = [];
    const adminRates = [];

    for (const t in debitRatesMap) {
      if (debitRatesMap.hasOwnProperty(t)) {
        debitRates.push({
          id: t,
          valor: debitRatesMap[t].valor,
        });
      }
    }

    for (const t in adminRatesMap) {
      if (adminRatesMap.hasOwnProperty(t)) {
        adminRates.push({
          id: t,
          valor: adminRatesMap[t].valor,
        });
      }
    }

    data.condicaoComercial.antecipacao = data.condicaoComercial.taxaContratual;
    data.condicaoComercial.taxaContratual = exisiting.taxaContratualId;
    data.condicaoComercial.taxasAdministrativas = adminRates;
    data.condicaoComercial.taxasDebito = debitRates;
    data.createCapturas = createCapturas;
    data.createSocios = createSocios;
    data.deleteSocios = deleteSocios;
    data.deleteCapturas = deleteCapturas;

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
      id: data.dadosCadastrais.id,
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
      createCapturas: data.createCapturas,
      createSocios: data.createSocios,
      deleteSocios: data.deleteSocios,
      deleteCapturas: data.deleteCapturas,
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
      socios: data.dadosCadastrais.socios,
      arquivos: {
        analises: [],
      },
    };

    if (credenciamento.tipoPessoa === tiposPessoa.juridica) {
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

      if (Array.isArray(unchangedFiles)) {
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
    }

    return credenciamento;
  };

  const updateData = (credenciamento) => {
    const includes = [
      { model: 'credenciamentoInstalacao', obj: 'instalacao' },
      { model: 'credenciamentoContato', obj: 'contato' },
    ];
    const includesArrays = [
      { model: 'credenciamentoDomicilioBancario', obj: 'domiciliosBancarios', id: 'bandeiraId' },
      { model: 'credenciamentoCaptura', obj: 'capturas', id: 'capturaId' },
      { model: 'credenciamentoTaxaAdministrativa', obj: 'taxasAdministrativas', id: 'taxaAdministrativaId' },
      { model: 'credenciamentoTaxaDebito', obj: 'taxasDebito', id: 'taxaBandeiraId' },
    ];

    if (+credenciamento.tipoPessoa === personTypeEnum.juridica) {
      includesArrays.push({ model: 'credenciamentoSocio', obj: 'socios', id: 'id' });
    }

    return db.transaction(transaction => db.entities.credenciamento.update(
      credenciamento,
      {
        transaction,
        where: { id: credenciamento.id },
      },
    ).then(() => {
      const promises = includes.map(include => db.entities[include.model].update(
        credenciamento[include.obj],
        {
          transaction,
          where: { credenciamentoId: credenciamento.id },
        }
      ));

      const promisesObj = includesArrays.map(include => credenciamento[include.obj].forEach((objCredenciamento) => {
        const where = {
          credenciamentoId: credenciamento.id,
        };
        where[include.id] = objCredenciamento[include.id];
        return db.entities[include.model].update(objCredenciamento, {
          transaction,
          where,
        });
      }));

      if (credenciamento.createCapturas) {
        const capturas = credenciamento.createCapturas.map(captura => ({
          capturaId: captura.id,
          quantidade: captura.quantidade,
          valor: captura.valor,
          credenciamentoId: credenciamento.id,
        }));
        promises.push(db.entities.credenciamentoCaptura.bulkCreate(capturas, {
          transaction
        }));
      }

      if (credenciamento.createSocios) {
        promises.push(db.entities.credenciamentoSocio.bulkCreate(credenciamento.createSocios, {
          transaction
        }));
      }

      if (credenciamento.deleteSocios) {
        promises.push(db.entities.credenciamentoSocio.destroy({
          transaction,
          where: { id: credenciamento.deleteSocios.map(socio => socio.id) },
        }));
      }

      if (credenciamento.deleteCapturas) {
        promises.push(db.entities.credenciamentoCaptura.destroy({
          transaction,
          where: { id: credenciamento.deleteCapturas.map(captura => captura.id) },
        }));
      }

      return Promise.all([promises, promisesObj]);
    })
    );
  };

  return findExisting(data.dadosCadastrais.id)
    .then(validate)
    .then(() => mapFiles(files, documento, 'credenciamento'))
    .then(uploadFiles)
    .then(assembleData)
    .then(updateData);
};

export default editAnalyze;
