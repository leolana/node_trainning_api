/* eslint-disable max-len */
const recusaTipo = require('./service/motivoRecusa/recusa-tipo.enum');

module.exports = (di) => {
  di.provide(
    '$seed',
    '$main-db',
    '@@tipos-pessoa',
    '@@tipos-captura',
    '@@credenciamento-status',
    '@@participante-indicacao-status',
    '@@cessao-status',
    '@@termo-tipo',
    '@@roles',
    (
      db,
      tiposPessoa,
      tiposCaptura,
      credenciamentoStatus,
      statusIndicacao,
      cessaoStatus,
      termoTipo,
      roles,
    ) => {
      const userDefault = 'admin';
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const termos = () => {
        const fake = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam mattis pulvinar enim sed tempus. Curabitur feugiat lacinia elit, vitae condimentum velit venenatis ut. Nullam rutrum velit non ante feugiat auctor. Pellentesque semper bibendum nulla, id suscipit diam dignissim id. Aenean id varius neque. In faucibus, risus eget ullamcorper maximus, lorem felis euismod nunc, nec laoreet quam tellus interdum nunc. Curabitur feugiat nec erat id commodo. Etiam diam neque, vehicula in nisl id, consectetur interdum justo. Etiam quis scelerisque mi, id luctus massa. Ut interdum purus quis metus fermentum, sagittis dapibus tellus varius. Nulla consectetur porttitor tortor at convallis. In molestie vulputate augue.'
          + 'Mauris eu lacinia lacus, non viverra tellus. Curabitur pellentesque blandit ultricies. Ut suscipit malesuada ex. Fusce feugiat nibh et neque aliquet eleifend eu ut mauris. Suspendisse feugiat, nisl et lacinia tincidunt, lorem turpis varius leo, sed blandit turpis quam non risus. Quisque et mattis ligula. Nulla vitae lacus convallis, laoreet leo at, consequat risus. Quisque euismod fringilla gravida. Quisque lobortis ut elit at mollis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut sit amet dolor nulla. Sed sagittis efficitur lorem, at venenatis quam porta quis. Integer nec rutrum ligula, id volutpat erat. Nam in fermentum quam, id pretium ante.'
          + 'Ut venenatis dui in nisl venenatis mollis. Suspendisse laoreet venenatis mi, id sodales metus vulputate a. Nullam nec varius nisi. Phasellus dolor orci, porttitor quis tristique sed, venenatis ac augue. Sed auctor risus nec felis faucibus, vel consequat justo consequat. Nunc pellentesque enim eget sapien auctor auctor. Maecenas pellentesque feugiat massa, ac efficitur odio. Duis et ex ut mi iaculis ultrices eleifend laoreet massa.';

        return db.entities.termo.bulkCreate([
          {
            titulo: 'Aditivo',
            tipo: termoTipo.aditivo,
            usuario: userDefault,
            texto:
              'As instruções constantes deste FORMULÁRIO foram dadas pelo ESTABELECIMENTO, devendo ser cumpridas pela ALPE e estão sujeitas \n'
              + 'aos termos e condições constantes do Instrumento Particular de Prestação de Serviços de Credenciamento de Estabelecimento \n'
              + 'e seus Anexos e Aditivos.',
            inicio: today,
          },
          {
            titulo: 'Termo de Adesão Fornecedor',
            tipo: termoTipo.contratoMaeFornecedor,
            usuario: userDefault,
            texto: fake,
            inicio: today,
          },
          {
            titulo: 'Termo de Adesão Estabelecimento',
            tipo: termoTipo.contratoMaeEstabelecimento,
            usuario: userDefault,
            texto: 'Termo impresso',
            inicio: today,
          },
        ]);
      };

      const cidades = () => db.entities.cidade.bulkCreate([
        { nome: 'Santos', estado: 'SP' },
        { nome: 'Sorocaba', estado: 'SP' },
        { nome: 'São Paulo', estado: 'SP' },
      ]);

      const motivoRecusa = () => db.entities.motivoRecusa.bulkCreate([
        {
          codigo: '001',
          descricao: 'Dados inconsistentes',
          requerObservacao: false,
          ativo: true,
        },
        {
          codigo: '002',
          descricao: 'Fornecedor desconhece o Estabelecimento',
          requerObservacao: false,
          ativo: true,
        },
        {
          codigo: '002',
          descricao: 'Fornecedor desconhece o Estabelecimento',
          requerObservacao: false,
          ativo: true,
        }, {
          codigo: '003',
          descricao: 'Fornecedor não possui interesse na proposta Alpe',
          requerObservacao: false,
          ativo: true,
        }, {
          codigo: '099',
          descricao: 'Outros',
          requerObservacao: true,
          ativo: true,
        }, {
          codigo: '004',
          descricao: 'Taxas não atrativas',
          requerObservacao: false,
          ativo: true,
        }, {
          codigo: '005',
          descricao: 'Estabelecimento não possui interesse na proposta Alpe',
          requerObservacao: false,
          ativo: true,
        }, {
          codigo: '006',
          descricao: 'Estabelecimento não possui interesse em Cessão',
          requerObservacao: false,
          ativo: true,
        }, {
          codigo: '007',
          descricao: 'Estabelecimento não possui limite com fornecedor',
          requerObservacao: false,
          ativo: true,
        }, {
          codigo: '008',
          descricao: 'Estabelecimento parou de emitir pedido junto ao Fornecedor',
          requerObservacao: false,
          ativo: true,
        }, {
          codigo: '009',
          descricao: 'Fornecedor entregou a mercadoria errada',
          requerObservacao: false,
          ativo: true,
        }, {
          codigo: '010',
          descricao: 'Fornecedor entregou mercadoria fora do prazo combinado',
          requerObservacao: false,
          ativo: true,
        },
      ]);

      const faturamentoCartao = () => {
        db.entities.faturamentoCartao.bulkCreate([
          { descricao: 'Até 100.000' },
          { descricao: 'Entre 100.000 e 400.000' },
          { descricao: 'Entre 400.000 e 800.000' },
          { descricao: 'Acima de 800.000' },
        ]);
      };

      const ticketMedio = () => db.entities.ticketMedio.bulkCreate([
        { descricao: 'Até R$ 10' },
        { descricao: 'Até R$ 50' },
        { descricao: 'Até R$ 100' },
        { descricao: 'Até R$ 200' },
        { descricao: 'Até R$ 500' },
        { descricao: 'Acima de R$ 500' },
      ]);

      const ramoAtividade = () => db.entities.ramoAtividade.bulkCreate([
        { codigo: 742, descricao: 'Veterinaria', restritoPJ: false },
        { codigo: 763, descricao: 'Cooperativa Agrícola', restritoPJ: true },
        {
          codigo: 1761,
          descricao: 'Metalurgicos',
          ativo: false,
          restritoPJ: true,
        },
        {
          codigo: 1740,
          descricao: 'Pedreiros e Serviços de Instalação',
          ativo: false,
          restritoPJ: true,
        },
      ]);

      const bandeiras = () => db.entities.bandeira.bulkCreate([
        { nome: 'Mastercard' },
        { nome: 'Visa' },
        { nome: 'Elo' },
        { nome: 'Hipercard' },
      ]);

      const taxaContratual = () => db.entities.taxaContratual.bulkCreate([
        {
          inicio: today,
          antecipacao: 1.8,
          adesao: 250,
          maximoParcelas: '12',
          usuario: userDefault,
        },
      ]);

      const produtos = () => Promise.all([
        db.entities.produto
          .create({
            nome: 'POS com Fio',
            usuario: userDefault,
          })
          .then(produto => db.entities.captura.create({
            produtoId: produto.id,
            inicio: today,
            tipoCaptura: tiposCaptura.aluguel,
            valor: 55,
            usuario: userDefault,
          })),
        db.entities.produto
          .create({
            nome: 'POS sem Fio',
            usuario: userDefault,
          })
          .then(produto => db.entities.captura.create({
            produtoId: produto.id,
            inicio: today,
            tipoCaptura: tiposCaptura.aluguel,
            valor: 75,
            usuario: userDefault,
          })),
        db.entities.produto
          .create({
            nome: 'TEF',
            usuario: userDefault,
          })
          .then(produto => Promise.all([
            db.entities.captura.create({
              produtoId: produto.id,
              inicio: today,
              tipoCaptura: tiposCaptura.aluguel,
              valor: 60,
              usuario: userDefault,
            }),
            db.entities.captura.create({
              produtoId: produto.id,
              inicio: today,
              tipoCaptura: tiposCaptura.venda,
              valor: 1550,
              usuario: userDefault,
            }),
          ])),
      ]);

      const eventos = () => db.entities.evento.bulkCreate([
        { id: 1, nome: 'Débito' },
        { id: 2, nome: 'Crédito à vista' },
        { id: 3, nome: 'Parcelado 2 a 6' },
        { id: 4, nome: 'Parcelado 7 a 12' },
        { id: 100, nome: 'Aluguel POS' },
        { id: 101, nome: 'Cancelamento Débito' },
        { id: 102, nome: 'Cancelamento Crédito' },
        { id: 103, nome: 'Substituição Recebível' },
        { id: 121, nome: 'Ajuste à crédito para o EC' },
        { id: 133, nome: 'Ajustes de cessão' },
        { id: 123, nome: 'Ajustes de reserva de cessão' },
        { id: 22, nome: 'Reserva crédito à vista' },
        { id: 23, nome: 'Reserva parcelado 2 a 6' },
        { id: 24, nome: 'Reserva parcelado 7 a 12' },
        { id: 32, nome: 'Cessão Crédito à vista' },
        { id: 33, nome: 'Cessão Parcelado 2 a 6' },
        { id: 34, nome: 'Cessão Parcelado 7 a 12' },
        { id: 222, nome: 'Tarifa Cessão' },
        { id: 112, nome: 'Crédito à vista antecipado ' },
        { id: 113, nome: 'Parcelado 2 a 6 antecipado' },
        { id: 114, nome: 'Parcelado 7 a 12 antecipado' },
        { id: 122, nome: 'Ajuste à débito' },
      ]);

      const taxas = () => {
        const aVistaRange = {
          minimo: 1,
          maximo: 1,
          usuario: userDefault,
        };
        const doisASeis = {
          minimo: 2,
          maximo: 6,
          usuario: userDefault,
        };
        const seteADoze = {
          minimo: 7,
          maximo: 12,
          usuario: userDefault,
        };

        const taxasDebitoBandeira = {
          Mastercard: 2.03,
          Visa: 2.03,
          Elo: 2.43,
          Hipercard: 2.18,
        };

        const taxasAdministrativasBandeiras = {
          Mastercard: [
            { valor: 2.51, ...aVistaRange },
            { valor: 3.18, ...doisASeis },
            { valor: 3.24, ...seteADoze },
          ],
          Visa: [
            { valor: 2.51, ...aVistaRange },
            { valor: 3.18, ...doisASeis },
            { valor: 3.24, ...seteADoze },
          ],
          Elo: [
            { valor: 2.91, ...aVistaRange },
            { valor: 3.34, ...doisASeis },
            { valor: 3.67, ...seteADoze },
          ],
          Hipercard: [
            { valor: 2.66, ...aVistaRange },
            { valor: 3.33, ...doisASeis },
            { valor: 3.39, ...seteADoze },
          ],
        };

        const promise = Promise.all([
          db.entities.bandeira.findAll(),
          db.entities.faturamentoCartao.findAll(),
        ]).then((results) => {
          const bandeiras = results[0];
          const faturamentos = results[1];

          const prazos = [
            { prazo: 33, coeficiente: 0 },
            { prazo: 14, coeficiente: 0.8 },
            { prazo: 3, coeficiente: 1.8 },
          ];
          aVistaRange.eventoId = 2;
          doisASeis.eventoId = 3;
          seteADoze.eventoId = 4;

          const ranges = [aVistaRange, doisASeis, seteADoze];
          const taxaPrazos = prazos
            .reduce((accumulator, current) => {
              const prazos = ranges.map(r => ({
                prazo: current.prazo,
                coeficiente: current.coeficiente,
                ...r,
              }));

              accumulator = accumulator.concat(prazos);
              return accumulator;
            }, [])
            .map((tt) => {
              tt.taxasAdministrativas = bandeiras.map(b => ({
                bandeiraId: b.id,
                valorBase: taxasAdministrativasBandeiras[b.nome].find(
                  t => t.minimo === tt.minimo && t.maximo === tt.maximo,
                ).valor,
                usuario: userDefault,
              }));

              return tt;
            });

          const taxa = {
            inicio: '2018-08-01',
            default: true,
            usuario: userDefault,
            bandeiras: bandeiras.map(b => ({
              taxaDebito: taxasDebitoBandeira[b.nome],
              bandeiraId: b.id,
              usuario: userDefault,
              faturamentos: faturamentos.map(f => ({
                faturamentoCartaoId: f.id,
                coeficiente: 0,
                usuario: userDefault,
              })),
            })),
            prazos: taxaPrazos,
          };

          return db.entities.taxa
            .create(taxa, {
              include: [
                {
                  model: db.entities.taxaBandeira,
                  as: 'bandeiras',
                  include: {
                    model: db.entities.taxaFaturamento,
                    as: 'faturamentos',
                  },
                },
                {
                  model: db.entities.taxaPrazo,
                  as: 'prazos',
                  include: {
                    model: db.entities.taxaAdministrativa,
                    as: 'taxasAdministrativas',
                  },
                },
              ],
            });
        });

        return promise;
      };

      const propostas = participante => db.entities.credenciamentoProposta
        .bulkCreate([
          {
            tipoPessoa: tiposPessoa.fisica,
            nome: 'Walter Kovacs',
            documento: '11122233396',
            arquivos: {
              identidade: 'http://',
              fichaCadastro: 'http://',
              comprovanteDeResidencia: 'http://',
              extratosBancarios: ['http://'],
            },
            usuario: 'admin',
            participanteId: participante.id,
          },
        ]);

      const credenciamentos = () => {
        const cidadeId = 1;
        const faturamentoId = 1;
        const ticketId = 1;
        const ramoAtividadeCodigo = 742;
        const taxaContratualId = 1;
        const banco = { id: '246', text: 'Banco ABC Brasil S.A.' };

        return Promise.all([
          db.entities.taxaBandeira.findAll(),
          db.entities.taxaPrazo.findAll({
            where: {
              prazo: 14,
            },
            include: [
              {
                model: db.entities.taxaAdministrativa,
                as: 'taxasAdministrativas',
              },
            ],
          }),
        ]).then((result) => {
          const taxasBandeira = result[0];
          const taxasPrazo = result[1];

          const taxasAdministrativas = [];

          taxasPrazo.forEach((p) => {
            p.taxasAdministrativas.forEach((a) => {
              taxasAdministrativas.push({
                taxaAdministrativaId: a.id,
                valor: a.valorBase + p.coeficiente,
              });
            });
          });

          return Promise.all([
            db.entities.credenciamento.create(
              {
                nome: 'It Lab',
                tipoPessoa: tiposPessoa.juridica,
                ramoAtividadeCodigo,
                documento: '01510345000158',
                aberturaNascimento: new Date(2002, 1, 15),
                telefone: '1111223344',
                cep: '04533010',
                logradouro: 'Rua Tabapuã',
                numero: '145',
                complemento: 'bloco unico',
                bairro: 'Itaim Bibi',
                cidadeId,
                faturamentoCartaoId: faturamentoId,
                ticketMedioId: ticketId,
                ecommerce: 'www.itlab.com.br',
                taxaContratualId,
                usuario: 'admin',
                razaoSocial:
                  'It Lab Consultoria e Desenvolvimento de Sistemas LTDA.',
                inscricaoEstadual: '287.046.269.490',
                inscricaoMunicipal: '227.616.175.362',
                instalacao: {
                  cep: '04533010',
                  logradouro: 'Rua Tabapuã',
                  numero: '145',
                  complemento: 'bloco unico',
                  bairro: 'Itaim Bibi',
                  cidadeId,
                  dias: 1,
                  horario: 1,
                  nome: 'Matthew Mercer',
                  email: 'matthew.mercer@itlab.com.br',
                  telefone: '1134897010',
                  celular: '11919371452',
                },
                contato: {
                  nome: 'Wilfrid Luettgen',
                  email: 'gabriel.lima@itlab.com.br',
                  telefone: '1175378173',
                  celular: '11971528763',
                },
                taxasAdministrativas,
                taxasDebito: taxasBandeira.map(t => ({
                  taxaBandeiraId: t.id,
                  valor: t.taxaDebito,
                })),
                capturas: [
                  {
                    capturaId: 1,
                    quantidade: 2,
                  },
                  {
                    capturaId: 3,
                    quantidade: 1,
                  },
                ],
                domiciliosBancarios: [
                  {
                    bandeiraId: 1,
                    bancoId: banco.id,
                    bancoNome: banco.text,
                    agencia: '123',
                    conta: '123',
                    digito: '1',
                  },
                  {
                    bandeiraId: 2,
                    bancoId: banco.id,
                    bancoNome: banco.text,
                    agencia: '123',
                    conta: '123',
                    digito: '1',
                  },
                  {
                    bandeiraId: 3,
                    bancoId: banco.id,
                    bancoNome: banco.text,
                    agencia: '123',
                    conta: '123',
                    digito: '1',
                  },
                  {
                    bandeiraId: 4,
                    bancoId: banco.id,
                    bancoNome: banco.text,
                    agencia: '123',
                    conta: '123',
                    digito: '1',
                  },
                ],
                historicoAprovacao: [
                  {
                    status: credenciamentoStatus.pendente,
                    usuario: 'admin',
                    observacao: '',
                  },
                ],
                arquivos: {
                  contratoSocial:
                    'credenciamento/01510345000158/contratoSocial/2018-10-31T14-53-09-039Z/contrato.pdf',
                  extratosBancarios: [
                    'credenciamento/01510345000158/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf',
                  ],
                  analises: [],
                },
                socios: [
                  {
                    tipoPessoa: tiposPessoa.fisica,
                    documento: '95015328010',
                    nome: 'Matthew Mercer',
                    aberturaNascimento: new Date('1982-06-29'),
                    email: 'matthew.mercer@itlab.com.br',
                    telefone: '1134897010',
                    participacao: 50,
                    rg: '286358529',
                    celular: '11919371452',
                    contato: true,
                    nomeMae: 'Amanda Miller',
                  },
                  {
                    tipoPessoa: tiposPessoa.fisica,
                    documento: '99097195098',
                    nome: 'Keanu Reeves',
                    aberturaNascimento: new Date('1964-09-02'),
                    email: 'keanu.reeves@itlab.com.br',
                    telefone: '1124055918',
                    participacao: 50,
                    rg: '148200321',
                    celular: '11998347613',
                    contato: true,
                    nomeMae: 'Patricia Reeves',
                  },
                ],
              },
              {
                include: [
                  {
                    model: db.entities.credenciamentoDomicilioBancario,
                    as: 'domiciliosBancarios',
                  },
                  { model: db.entities.credenciamentoCaptura, as: 'capturas' },
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
                  { model: db.entities.credenciamentoContato, as: 'contato' },
                  { model: db.entities.credenciamentoSocio, as: 'socios' },
                ],
              },
            ),
            db.entities.participante.create(
              {
                tipoPessoa: tiposPessoa.juridica,
                ramoAtividadeCodigo,
                documento: '01510345000158',
                nome: 'It Lab - Estabelecimento',
                aberturaNascimento: new Date(2002, 1, 15),
                telefone: '1111223344',
                cep: '04533010',
                logradouro: 'Rua Tabapuã',
                numero: '145',
                complemento: 'bloco unico',
                bairro: 'Itaim Bibi',
                cidadeId,
                razaoSocial:
                  'It Lab Consultoria e Desenvolvimento de Sistemas LTDA.',
                inscricaoEstadual: '287.046.269.490',
                inscricaoMunicipal: '227.616.175.362',
                ativo: true,
                usuario: 'admin',
                arquivos: {
                  contratoSocial: 'credenciamento/01510345000158/contratoSocial/2018-10-31T14-53-09-039Z/contrato.pdf',
                  extratosBancarios: ['credenciamento/01510345000158/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf'],
                  analises: [],
                },
                contatos: [
                  {
                    nome: 'Samuel Jackson',
                    email: 'samuel.jackson@itlab.com.br',
                    celular: '11998217734',
                    ativo: true,
                  },
                ],
                taxas: [
                  {
                    valorInicio: null,
                    valorFim: null,
                    taxa: 2.0,
                    usuarioCriacao: 'admin',
                    participanteTaxaTipo: 2,
                  },
                ],
              },
              {
                include: [
                  {
                    model: db.entities.participanteContato,
                    as: 'contatos',
                  },
                  {
                    model: db.entities.participanteTaxa,
                    as: 'taxas',
                  },
                ],
              },
            )
              .then(participante => Promise.all([
                db.entities.participanteEstabelecimento.create({
                  participanteId: participante.id,
                }),
                db.entities.participanteIndicacao.create({
                  participanteId: participante.id,
                  tipoPessoa: tiposPessoa.juridica,
                  documento: '13769015000160',
                  nome: 'Xerxes Autopeças',
                  email: 'xerxes@itlab.com.br',
                  telefone: '1128943783',
                  canalEntrada: 1, // Indicação por EC
                  usuario: 'admin',
                  status: statusIndicacao.pendente,
                }),
              ]))
              .then(() => db.entities.participante.create(
                {
                  tipoPessoa: tiposPessoa.juridica,
                  ramoAtividadeCodigo,
                  documento: '32608796000156',
                  nome: 'KG Menswear - Fornecedor',
                  aberturaNascimento: new Date(1985, 7, 13),
                  telefone: '2017888135',
                  cep: '07304',
                  logradouro: 'Desert Broom Court',
                  numero: '1138',
                  complemento: '',
                  bairro: 'Jersey City',
                  cidadeId,
                  razaoSocial: 'KG Menswear LTDA.',
                  inscricaoEstadual: '4485.5579.9298',
                  inscricaoMunicipal: '5399.1521.6999',
                  ativo: true,
                  usuario: 'admin',
                  arquivos: {
                    extratosBancarios: ['fornecedor/32608796000156/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf'],
                  },
                  contatos: [
                    {
                      nome: 'Harrison Ford',
                      email: 'harrison@kg.com',
                      celular: '11999237831',
                      ativo: true,
                    },
                  ],
                  domiciliosBancarios: [
                    {
                      bandeiraId: 1,
                      bancoId: banco.id,
                      bancoNome: banco.text,
                      agencia: '6712',
                      conta: '871',
                      digito: '0',
                    },
                    {
                      bandeiraId: 2,
                      bancoId: banco.id,
                      bancoNome: banco.text,
                      agencia: '6712',
                      conta: '871',
                      digito: '0',
                    },
                    {
                      bandeiraId: 3,
                      bancoId: banco.id,
                      bancoNome: banco.text,
                      agencia: '6712',
                      conta: '871',
                      digito: '0',
                    },
                    {
                      bandeiraId: 4,
                      bancoId: banco.id,
                      bancoNome: banco.text,
                      agencia: '6712',
                      conta: '871',
                      digito: '0',
                    },
                  ],
                  taxas: [
                    {
                      valorInicio: 0,
                      valorFim: 1000,
                      taxa: 5.0,
                      usuarioCriacao: 'admin',
                      participanteTaxaTipo: 1,
                    },
                    {
                      valorInicio: null,
                      valorFim: null,
                      taxa: 2.0,
                      usuarioCriacao: 'admin',
                      participanteTaxaTipo: 2,
                    },
                  ],
                },
                {
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
                }
              ))
              .then(participante => Promise.all([
                db.entities.participanteFornecedor.create({
                  participanteId: participante.id,
                }),
                db.entities.participanteIndicacao.create({
                  participanteId: participante.id,
                  tipoPessoa: tiposPessoa.juridica,
                  documento: '37404888000138',
                  nome: 'Navarro Oficinas',
                  email: 'navarro@itlab.com.br',
                  telefone: '1144539801',
                  canalEntrada: 2, // Indicação por Fornecedor
                  usuario: 'admin',
                  status: statusIndicacao.pendente,
                }),
                db.entities.participanteHistorico.create({
                  participanteId: participante.id,
                  tipoPessoa: participante.tipoPessoa,
                  ramoAtividadeCodigo: participante.ramoAtividadeCodigo,
                  documento: participante.documento,
                  nome: participante.nome,
                  aberturaNascimento: participante.aberturaNascimento,
                  telefone: participante.telefone,
                  cep: participante.cep,
                  logradouro: participante.logradouro,
                  numero: participante.numero,
                  complemento: participante.complemento,
                  bairro: participante.bairro,
                  cidadeId: participante.cidadeId,
                  nomeMae: participante.nomeMae,
                  razaoSocial: participante.razaoSocial,
                  inscricaoEstadual: participante.inscricaoEstadual,
                  inscricaoMunicipal: participante.inscricaoMunicipal,
                  ativo: participante.ativo,
                  usuario: participante.usuario,
                }),
                propostas(participante),
              ])),
          ]);
        });
      };

      const vinculos = () => Promise.all([
        db.entities.participanteFornecedor.findAll(),
        db.entities.participanteEstabelecimento.findAll(),
      ]).then(([fornecedores, estabelecimentos]) => {
        const promises = [];
        fornecedores.forEach((fornecedor) => {
          estabelecimentos.forEach((estabelecimento) => {
            promises.push(
              db.entities.participanteVinculo.create({
                participanteEstabelecimentoId:
                  estabelecimento.participanteId,
                participanteFornecedorId: fornecedor.participanteId,
                usuario: userDefault,
                exibeValorDisponivel: true,
                diasAprovacao: 2,
                estabelecimentoSolicitouVinculo: true,
                status: 3,
              }),
            );
          });
        });

        return Promise.all(promises);
      });

      const cessoes = () => db.entities.participanteVinculo
        .findAll()
        .then((vinculos) => {
          const promises = [];
          const include = {
            include: [{ model: db.entities.cessaoRecebivel, as: 'recebiveis' }],
          };

          vinculos.forEach((v) => {
            promises.push(
              db.entities.cessao.create(
                {
                  participanteVinculoId: v.id,
                  usuario: userDefault,
                  valorSolicitado: 10,
                  valorDisponivel: 10,
                  dataVencimento: new Date('2019-04-30'),
                  dataExpiracao: new Date('2019-04-30'),
                  referencia: '123',
                  codigoCessao: '111111111',
                  solicitante: 'Charles Stone',
                  status: cessaoStatus.aguardandoAprovacao,
                  recebiveis: [
                    {
                      dataVenda: new Date('2019-01-01'),
                      valorVenda: 5,
                      eventoId: 1,
                    },
                    {
                      dataVenda: new Date('2019-01-01'),
                      valorVenda: 5,
                      eventoId: 1,
                    },
                    {
                      dataVenda: new Date('2019-01-01'),
                      valorVenda: 7,
                      eventoId: 123,
                    },
                  ],
                },
                include,
              ),
            );

            promises.push(
              db.entities.cessao.create(
                {
                  participanteVinculoId: v.id,
                  usuario: userDefault,
                  valorSolicitado: 100.07,
                  valorDisponivel: 100,
                  dataVencimento: new Date('2018-01-30'),
                  dataExpiracao: new Date('2018-01-30'),
                  codigoCessao: '22222222',
                  solicitante: 'Charles Stone',
                  status: cessaoStatus.aguardandoAprovacao,
                  recebiveis: [
                    {
                      dataVenda: new Date('2018-01-01'),
                      valorVenda: 50,
                      eventoId: 1,
                    },
                    {
                      dataVenda: new Date('2018-01-01'),
                      valorVenda: 44,
                      eventoId: 1,
                    },
                    {
                      dataVenda: new Date('2019-01-01'),
                      valorVenda: 6,
                      eventoId: 123,
                    },
                  ],
                },
                include,
              ),
            );
          });

          return Promise.all(promises);
        });

      const usuarios = () => Promise.all([
        db.entities.usuarioConvite.create({
          codigo: '00000000-0000-0000-0000-000000000000',
          nome: 'Marcelo Néias',
          email: 'marcelo@itlab',
          celular: '11922223333',
          roles: [roles.super],
          participante: 1,
          convidadoPor: 'alpe@alpe.com.br',
          expiraEm: '2019-01-01',
        }),
        db.entities.usuario.create({
          id: '80ecf4dd-9ce3-4ae5-913e-3f488174bc2c',
          nome: 'Alpe',
          email: 'alpe@alpe.com.br',
          celular: '11988887777',
          roles: [roles.boAdministrador], // , roles.ecAdministrador, roles.fcAdministrador]
          // }).then(usuario => Promise.all([
          //     db.entities.membro.create({ usuarioId: usuario.id, participanteId: 1 }),
          //     db.entities.membro.create({ usuarioId: usuario.id, participanteId: 2 })
          // ])),
        }),
        db.entities.usuario
          .create({
            id: '4f9df9ab-a2dd-4f7b-b17a-d71d5d289ad7',
            nome: 'EC',
            email: 'ec@alpe.com.br',
            celular: '11988887777',
            roles: [roles.ecAdministrador],
          })
          .then(usuario => Promise.all([
            db.entities.membro.create({
              usuarioId: usuario.id,
              participanteId: 1,
            }),
          ])),
        db.entities.usuario
          .create({
            id: 'ac423132-265a-4f92-91ea-9c577b958b2b',
            nome: 'Fornecedor',
            email: 'fornecedor@alpe.com.br',
            celular: '11988887777',
            roles: [roles.fcAdministrador],
          })
          .then(usuario => Promise.all([
            db.entities.membro.create({
              usuarioId: usuario.id,
              participanteId: 2,
            }),
          ])),
      ]);

      const participanteExistenteSiscof = () => db.entities.participanteExistenteSiscof.bulkCreate([
        { participanteId: 410, documento: '54447115000158' },
        { participanteId: 73724, documento: '52780376000160' },
      ]);

      const antecipacoes = () => db.entities.participante
        .findAll()
        .then(participantes => Promise.all(
          participantes.map(participante => db.entities.antecipacao
            .create({
              participanteId: participante.id,
              usuario: userDefault,
              dataPagamento: new Date(),
            })
            .then(result => db.entities.antecipacaoRecebivel.create({
              antecipacaoId: result.id,
              dataPagamento: new Date(),
              diasAntecipacao: 2,
              valorPagar: 100,
              taxaAntecipacao: 0.8,
              descontoAntecipacao: 1.2,
              valorAntecipado: 98,
              rowId: 'AAADqEAAAAAACDGAAD',
              bandeiraId: 1,
              eventoId: 2,
            })))
        ));

      const motivoTipoRecusa = () => db.entities.motivoRecusa
        .findAll()
        .then((motivosRecusa) => {
          db.entities.motivoTipoRecusa
            .bulkCreate([
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '001').id,
                recusaTipoId: recusaTipo.cad_fornecedor,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '002').id,
                recusaTipoId: recusaTipo.cad_fornecedor,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '003').id,
                recusaTipoId: recusaTipo.cad_fornecedor,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '099').id,
                recusaTipoId: recusaTipo.cad_fornecedor,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '001').id,
                recusaTipoId: recusaTipo.cad_estabelecimento,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '004').id,
                recusaTipoId: recusaTipo.cad_estabelecimento,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '005').id,
                recusaTipoId: recusaTipo.cad_estabelecimento,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '099').id,
                recusaTipoId: recusaTipo.cad_estabelecimento,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '099').id,
                recusaTipoId: recusaTipo.recusa_vinculo,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '006').id,
                recusaTipoId: recusaTipo.recusa_vinculo,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '007').id,
                recusaTipoId: recusaTipo.recusa_vinculo,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '008').id,
                recusaTipoId: recusaTipo.recusa_vinculo,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '009').id,
                recusaTipoId: recusaTipo.recusa_vinculo,
              },
              {
                motivoRecusaId: motivosRecusa.find(obj => obj.codigo === '010').id,
                recusaTipoId: recusaTipo.recusa_vinculo,
              },

            ]);
        });

      const exportacoes = () => db.entities.exportacao
        .bulkCreate([
          {
            id: 1,
            arquivo: 'remessa_vendas_{date}.csv',
            titulo: 'Remessa de Vendas',
            descricao: 'E esta ave estranha e escura fez sorrir minha amargura, Com o solene decoro de seus ares rituais. "Tens o aspecto tosquiado", disse eu, "mas de nobre e ousado, Ó velho corvo emigrado lá das trevas infernais!"',
          },
          {
            id: 2,
            arquivo: 'registro_vendas_detalhe_{date}.csv',
            titulo: 'Registro de Vendas Detalhe',
            descricao: 'Seco de raiva, coloco no colo caviar e doces.',
          },
          {
            id: 3,
            arquivo: 'registro_vendas_resumo_{date}.csv',
            titulo: 'Registro de Vendas Resumo',
            descricao: 'Um pequeno jabuti xereta viu dez cegonhas felizes.',
          },
          {
            id: 4,
            arquivo: 'pagamentos_{date}.csv',
            titulo: 'Pagamentos',
            descricao: 'Qual é a velocidade de vôo de uma andorinha sem carga?',
          },
          {
            id: 5,
            arquivo: 'ajustes_tarifas_{date}.csv',
            titulo: 'Ajustes Tarifas',
            descricao: 'Ninguém espera a inquisição espanhola.',
          },
          {
            id: 6,
            arquivo: 'financeiro_{date}.csv',
            titulo: 'Financeiro',
            descricao: 'Mais vale um pássaro na mão que dois voando.',
          },
        ], { returning: true })
        .then(exportacoes => Promise.all([
          ...exportacoes.map(
            e => db.entities.participanteExportacao.create({
              participanteId: 1,
              exportacaoId: e.id,
            })
          ),
          ...exportacoes.map(
            e => db.entities.participanteExportacao.create({
              participanteId: 2,
              exportacaoId: e.id,
            })
          ),
        ]));

      const execute = () => {
        Promise.all([
          cidades(),
          faturamentoCartao(),
          ticketMedio(),
          ramoAtividade(),
          bandeiras(),
          produtos(),
          eventos(),
          termos(),
          participanteExistenteSiscof(),
          motivoRecusa(),
        ])
          .then(() => Promise.all([taxaContratual(), taxas()]))
          .then(() => Promise.all([credenciamentos()]))
          .then(() => usuarios())
          .then(() => Promise.all([vinculos()]))
          .then(() => Promise.all([cessoes()]))
          .then(() => Promise.all([antecipacoes()]))
          .then(() => exportacoes())
          .then(() => motivoTipoRecusa())
          .then(() => db.query('CREATE EXTENSION IF NOT EXISTS unaccent;'))
          .then(() => console.log('Dev data loaded!'))
          .catch(err => console.log('\n\n\n', err, '\n\n\n'));
      };

      return Promise.resolve({
        execute,
        bandeiras,
        taxaContratual,
        eventos,
        faturamentoCartao,
        taxas,
        ramoAtividades: ramoAtividade,
        cidades,
        ticketMedio,
        produtos,
        credenciamentos,
      });
    },
  );
};
