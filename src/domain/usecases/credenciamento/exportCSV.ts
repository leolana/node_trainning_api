// tslint:disable no-magic-numbers
import { Sequelize } from 'sequelize-database';
import { DateTime } from 'luxon';

import deformatDocument from '../../services/credenciamento/deformatDocument';

import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';
import tiposPessoa from '../../entities/tiposPessoa';

const exportData = (db: Sequelize) => async (options: any): Promise<string> => {
  const deaccent = (str: string) => (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '');

  const formatUrl = (str: string) => /https?:\/\//.test(str) ? str : `http://${str}`;

  const formatDate = (date: string) => {
    const formatted = DateTime.fromSQL(date).toFormat('dd/MM/yyyy');
    return formatted === 'Invalid DateTime' ? '' : formatted;
  };

  const validateNumeric = (str: string) => {
    const test = deaccent(str);
    return isNaN(test as any) ? null : test;
  };

  const getParams = (searchOptions: any) => {
    const searchParams = searchOptions || {};

    const where: any = {
      ativo: true,
      status: credenciamentoStatusEnum.aprovado
    };

    if (searchParams.de) {
      searchParams.de = DateTime.fromJSDate(new Date(searchParams.de)).toSQLDate();
    }

    if (searchParams.ate) {
      const date = DateTime.fromJSDate(new Date(searchParams.ate)).plus({ days: 1 });
      searchParams.ate = date.toSQLDate();
    }

    if (searchParams.de && searchParams.ate) {
      where.createdAt = {
        $between: [searchParams.de, searchParams.ate],
      };
    } else if (searchParams.de) {
      where.createdAt = {
        $gte: searchParams.de,
      };
    } else if (searchParams.ate) {
      where.createdAt = {
        $lte: searchParams.ate,
      };
    }

    if (searchParams.nome) {
      where.nome = { $iLike: `%${searchParams.nome}%` };
    }

    if (searchParams.codigoEc) {
      where.participanteId = searchParams.codigoEc;
    }

    if (searchParams.documento) {
      where.documento = {
        $iLike: `%${deformatDocument(searchParams.documento)}%`,
      };
    }

    return where;
  };

  const list = (where: any) => db.entities.credenciamento.findAll({
    where,
    attributes: [
      'documento',
      'tipoPessoa',
      'razaoSocial',
      'nome',
      'inscricaoEstadual',
      'aberturaNascimento',
      'cep',
      'logradouro',
      'numero',
      'bairro',
      'complemento',
      'ecommerce'
    ],
    include: [
      {
        model: db.entities.credenciamentoInstalacao,
        as: 'instalacao',
        attributes: ['cep', 'logradouro', 'numero', 'bairro', 'complemento', 'pontoReferencia', 'horario'],
        include: [{
          model: db.entities.cidade,
          as: 'cidade',
          attributes: ['nome', 'estado']
        }]
      },
      {
        model: db.entities.credenciamentoContato,
        as: 'contato',
        attributes: ['email', 'telefone', 'celular']
      },
      {
        model: db.entities.credenciamentoSocio,
        as: 'socios',
        attributes: ['nome', 'documento', 'aberturaNascimento', 'tipoPessoa', 'participacao']
      },
      {
        model: db.entities.credenciamentoDomicilioBancario,
        as: 'domiciliosBancarios',
        attributes: ['bancoId', 'agencia', 'conta', 'digito'],
        include : [{
          model: db.entities.bandeira,
          as: 'bandeira',
          attributes: ['nome']
        }]
      },
      {
        model: db.entities.credenciamentoCaptura,
        as: 'capturas',
        attributes: ['quantidade', 'capturaId'],
        include : [{
          model: db.entities.captura,
          as: 'captura',
          attributes: ['id'],
          include: [{
            model: db.entities.produto,
            as: 'produto',
            attributes: ['codigo']
          }]
        }]
      },
      {
        model: db.entities.ramoAtividade,
        as: 'ramoAtividade',
        attributes: ['descricao', 'departamento']
      },
      {
        model: db.entities.cidade,
        as: 'cidade',
        attributes: ['nome', 'estado']
      }
    ]
  });

  const map = (data: any[]) => data.map((r) => {
    const cadastro = r;
    const ramo = r.ramoAtividade;
    const instalacao = r.instalacao;
    const contato = r.contato;
    const domicilioMaster = (r.domiciliosBancarios || []).find(d => (d.bandeira.nome || '').includes('Master')) || {};
    const domicilioVisa = (r.domiciliosBancarios || []).find(d => (d.bandeira.nome || '').includes('Visa')) || {};
    const captura = r.capturas[0] || {};

    const socio = r.socios.reduce((max, curr) => {
      return curr.participacao > (max.participacao || 0)
        ? curr
        : max;
    },                            {});

    const socioPF = socio.tipoPessoa === tiposPessoa.fisica
      ? socio
      : r.socios.find(s => s.tipoPessoa === tiposPessoa.fisica) || {};

    // Ordem e campos não podem ser alterados, por estarem em conformidade com o layout da Global.
    return [
      deformatDocument(cadastro.documento),
      cadastro.tipoPessoa === tiposPessoa.fisica ? 'PF' : 'PJ',
      deaccent(cadastro.razaoSocial),
      deaccent(cadastro.nome),
      validateNumeric(cadastro.inscricaoEstadual),
      ramo.descricao || '',
      deaccent(instalacao.cep),
      deaccent(instalacao.logradouro).slice(0, 60),
      validateNumeric(instalacao.numero) || 0,
      instalacao.bairro.slice(0, 50),
      instalacao.cidade.nome.slice(0, 50),
      instalacao.cidade.estado,
      (instalacao.complemento || '').slice(0, 30),
      '', // Telefone Relist()sidencial
      contato.telefone,
      contato.celular || '',
      '', // Fax
      socio.nome,
      deaccent(cadastro.cep),
      deaccent(cadastro.logradouro).slice(0, 60),
      validateNumeric(cadastro.numero) || 0,
      cadastro.bairro.slice(0, 50),
      cadastro.cidade.nome.slice(0, 50),
      cadastro.cidade.estado,
      (cadastro.complemento || '').slice(0, 30),
      socio.nome,
      deformatDocument(socioPF.documento || ''),
      formatDate(socio.aberturaNascimento),
      instalacao.horario,
      formatDate(cadastro.aberturaNascimento),
      '', // Shopping
      instalacao.pontoReferencia || '',
      '', // URL
      cadastro.ecommerce ? formatUrl(cadastro.ecommerce) : '',
      contato.email,
      domicilioMaster.bancoId,
      domicilioMaster.agencia,
      '', // Digito Agência
      domicilioMaster.conta ? `${domicilioMaster.conta}${domicilioMaster.digito}` : '',
      domicilioMaster.bandeira ? domicilioMaster.bandeira.nome || '' : '',
      domicilioVisa.bancoId || '',
      domicilioVisa.agencia || '',
      '', // Digito Agência
      domicilioVisa.conta ? `${domicilioVisa.conta}${domicilioVisa.digito}` : '',
      domicilioVisa.bandeira ? domicilioVisa.bandeira.nome || '' : '',
      ramo.departamento || '',
      captura.captura.produto.codigo || '',
      captura.quantidade,
    ];
  });

  const generate = (dataMap: (string | number)[][]) => {
    return dataMap.reduce((acc, curr) => {
      acc.push(curr.join(';'));
      return acc;
    },                    []).join('\n');
  };

  delete options.status;

  const results = await list(getParams(options));
  const csv = generate(map(results));

  return csv;
};

export default exportData;
