// tslint:disable max-line-length
import { QueryInterface } from 'sequelize';
import { DateTime } from 'luxon';

import { defaultUser } from '../consts';
import termoTipo from '../../../domain/entities/termoTipo';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = DateTime.local();
    const today = now.toSQLDate();
    const timestamp = { createdAt: now.toSQL(), updatedAt: now.toSQL() };

    const termos = [
      {
        titulo: 'Aditivo',
        tipo: termoTipo.aditivo,
        usuario: defaultUser,
        texto: `As instruções constantes deste FORMULÁRIO foram dadas pelo ESTABELECIMENTO, devendo ser cumpridas pela ALPE e estão sujeitas
        aos termos e condições constantes do Instrumento Particular de Prestação de Serviços de Credenciamento de Estabelecimento
        e seus Anexos e Aditivos.`,
        inicio: today,
        fim: null,
        ...timestamp
      },
      {
        titulo: 'Termo de Adesão Fornecedor',
        tipo: termoTipo.contratoMaeFornecedor,
        usuario: defaultUser,
        texto: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam mattis pulvinar enim sed tempus. Curabitur feugiat lacinia elit, vitae condimentum velit venenatis ut. Nullam rutrum velit non ante feugiat auctor. Pellentesque semper bibendum nulla, id suscipit diam dignissim id. Aenean id varius neque. In faucibus, risus eget ullamcorper maximus, lorem felis euismod nunc, nec laoreet quam tellus interdum nunc. Curabitur feugiat nec erat id commodo. Etiam diam neque, vehicula in nisl id, consectetur interdum justo. Etiam quis scelerisque mi, id luctus massa. Ut interdum purus quis metus fermentum, sagittis dapibus tellus varius. Nulla consectetur porttitor tortor at convallis. In molestie vulputate augue.
        Mauris eu lacinia lacus, non viverra tellus. Curabitur pellentesque blandit ultricies. Ut suscipit malesuada ex. Fusce feugiat nibh et neque aliquet eleifend eu ut mauris. Suspendisse feugiat, nisl et lacinia tincidunt, lorem turpis varius leo, sed blandit turpis quam non risus. Quisque et mattis ligula. Nulla vitae lacus convallis, laoreet leo at, consequat risus. Quisque euismod fringilla gravida. Quisque lobortis ut elit at mollis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut sit amet dolor nulla. Sed sagittis efficitur lorem, at venenatis quam porta quis. Integer nec rutrum ligula, id volutpat erat. Nam in fermentum quam, id pretium ante.
        Ut venenatis dui in nisl venenatis mollis. Suspendisse laoreet venenatis mi, id sodales metus vulputate a. Nullam nec varius nisi. Phasellus dolor orci, porttitor quis tristique sed, venenatis ac augue. Sed auctor risus nec felis faucibus, vel consequat justo consequat. Nunc pellentesque enim eget sapien auctor auctor. Maecenas pellentesque feugiat massa, ac efficitur odio. Duis et ex ut mi iaculis ultrices eleifend laoreet massa.`,
        inicio: today,
        fim: null,
        ...timestamp
      },
      {
        titulo: 'Termo de Adesão Estabelecimento',
        tipo: termoTipo.contratoMaeEstabelecimento,
        usuario: defaultUser,
        texto: 'Termo impresso',
        inicio: today,
        fim: null,
        ...timestamp
      }
    ];

    return queryInterface.bulkInsert('termo', termos, {});
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete('termo', null, {});
  }
};
