const { DateTime } = require('luxon');

const saveFiles = require('../file/saveFiles.service');
const applyFiles = require('./applyFiles.service');
const credenciamentoStatus = require('./accreditationStatus.enum');
const tiposPessoa = require('../participante/personType.enum');


module.exports = (db, fileStorage) => (
  data,
  files,
  documento,
  user,
  unchangedFiles,
  transaction
) => {
  const validate = () => new Promise((resolve, reject) => {
    if (!Object.values(tiposPessoa).some(t => t === data.tipoPessoa)) {
      reject(String('tipoPessoa-invalido'));
    }

    const dataNascimentoAbertura = DateTime
      .fromISO(data.dadosCadastrais.aberturaNascimento)
      .toJSDate();
    const today = DateTime.local().toJSDate();

    if (dataNascimentoAbertura > today) {
      reject(String('dataAberturaNascimento-invalida'));
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
        reject(String('dataAberturaNascimento-socios-invalida'));
      }
    }

    resolve();
  });

  const uploadFiles = files => Promise.all(
    files.map(file => fileStorage.upload(file.name, file.content))
  );

  const assembleData = (uploadedFiles) => {
    if (data.dadosCadastrais.socios) {
      data.dadosCadastrais.socios.forEach((s) => {
        if (s.tipoPessoa === tiposPessoa.juridica && !s.rg) {
          s.rg = '';
        }
      });
    }

    const credenciamento = {
      nome: data.dadosCadastrais.nome,
      tipoPessoa: +data.tipoPessoa,
      ramoAtividadeCodigo: +data.dadosCadastrais.ramoAtividade,
      documento,
      aberturaNascimento:
        DateTime.fromISO(data.dadosCadastrais.aberturaNascimento).toISODate(),

      telefone: data.dadosCadastrais.telefone,
      cep: data.dadosCadastrais.cep,
      logradouro: data.dadosCadastrais.logradouro,
      complemento: data.dadosCadastrais.complemento,
      numero: data.dadosCadastrais.numero,
      bairro: data.dadosCadastrais.bairro,
      cidadeId: +data.dadosCadastrais.cidade,
      faturamentoCartaoId:
        +data.dadosCadastrais.informacoesFinanceiras.faturamentoAnual.id,
      ticketMedioId:
        +data.dadosCadastrais.informacoesFinanceiras.ticketMedio.id,
      ecommerce: data.captura.url,
      usuario: user,
      domiciliosBancarios: data.dadosCadastrais.domiciliosBancarios.map(t => ({
        bandeiraId: +t.bandeira.id,
        bancoId: t.banco.id,
        bancoNome: t.banco.text,
        agencia: t.agencia,
        conta: t.conta,
        digito: t.digito,
      })),
      capturas: data.captura.capturas.map(t => ({
        capturaId: +t.id,
        quantidade: +t.quantidade,
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
      socios: data.dadosCadastrais.socios,
      historicoAprovacao: [{
        status: credenciamentoStatus.pendente,
        usuario: user,
        observacao: '',
      }],
      arquivos: {
        extratosBancarios: [],
        analises: [],
      },
    };

    if (+credenciamento.tipoPessoa === tiposPessoa.fisica) {
      credenciamento.nomeMae = data.dadosCadastrais.nomeMae;
    } else {
      credenciamento.razaoSocial = data.dadosCadastrais.razaoSocial;
      credenciamento.inscricaoEstadual = data.dadosCadastrais.inscricaoEstadual;
      // eslint-disable-next-line max-len
      credenciamento.inscricaoMunicipal = data.dadosCadastrais.inscricaoMunicipal;
    }

    applyFiles(uploadedFiles, credenciamento);

    if (unchangedFiles) {
      if (unchangedFiles.analises) {
        credenciamento.arquivos.analises = unchangedFiles.analises;
      }

      unchangedFiles.forEach((f) => {
        if (f.id.startsWith('extrato')) {
          if (!credenciamento.arquivos.extratosBancarios.some(
            e => e === f.arquivo
          )) {
            credenciamento.arquivos.extratosBancarios.push(f.arquivo);
          }
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

    if (+credenciamento.tipoPessoa === tiposPessoa.juridica) {
      includes.push({ model: db.entities.credenciamentoSocio, as: 'socios' });
    }

    const initTransaction = transaction
      ? f => Promise.resolve(f(transaction))
      : db.transaction.bind(db);

    return initTransaction(transaction => db.entities.credenciamento.create(
      credenciamento,
      {
        include: includes,
        returning: true,
        transaction,
      },
    ));
  };

  return validate()
    .then(() => saveFiles('credenciamento', files, documento))
    .then(uploadFiles)
    .then(assembleData)
    .then(persistData);
};
