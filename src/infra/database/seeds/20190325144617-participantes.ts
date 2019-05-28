// tslint:disable: no-magic-numbers
import { QueryInterface } from 'sequelize';

import { defaultUser } from '../consts';
import tiposPessoa from '../../../domain/entities/tiposPessoa';

module.exports = {
  up: async (queryInterface: QueryInterface) => {

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const ramoAtividadeCodigo = 742;

    const participantes = [
      {

        ramoAtividadeCodigo,
        cidadeId: null,
        tipoPessoa: tiposPessoa.juridica,
        documento: '01510345000158',
        nome: 'It Lab - Estabelecimento',
        aberturaNascimento: new Date(2002, 1, 15),
        telefone: '1111223344',
        cep: '04533010',
        logradouro: 'Rua Tabapuã',
        numero: '145',
        complemento: 'bloco unico',
        bairro: 'Itaim Bibi',
        razaoSocial: 'It Lab Consultoria e Desenvolvimento de Sistemas LTDA.',
        inscricaoEstadual: '287.046.269.490',
        inscricaoMunicipal: '227.616.175.362',
        ativo: true,
        usuario: defaultUser,
        arquivos: {
          contratoSocial: 'credenciamento/01510345000158/contratoSocial/2018-10-31T14-53-09-039Z/contrato.pdf',
          analises: [],
        },
        ...timestamp
      },
      {

        ramoAtividadeCodigo,
        cidadeId: null,
        tipoPessoa: tiposPessoa.juridica,
        documento: '32608796000156',
        nome: 'KG Menswear - Fornecedor',
        aberturaNascimento: new Date(1985, 7, 13),
        telefone: '2017888135',
        cep: '07304',
        logradouro: 'Desert Broom Court',
        numero: '1138',
        complemento: '',
        bairro: 'Jersey City',
        razaoSocial: 'KG Menswear LTDA.',
        inscricaoEstadual: '4485.5579.9298',
        inscricaoMunicipal: '5399.1521.6999',
        ativo: true,
        usuario: defaultUser,
        arquivos: {},
        ...timestamp
      }
    ];

    await queryInterface.bulkInsert('participante', participantes, { returning: true });
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('participanteAceiteTermo', null, {}),
      queryInterface.bulkDelete('participanteHistorico', null, {}),
    ]);
    return queryInterface.bulkDelete('participante', null, {});
  }
};
