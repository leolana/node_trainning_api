// tslint:disable:no-magic-numbers
import mapMovideskPersonDataFromParticipanteUseCase from '../../../../../src/domain/usecases/movidesk/mapMovideskPersonDataFromParticipanteUseCase';
import { MovideskTipoPessoa, MovideskTipoPerfil } from '../../../../../src/infra/movidesk/PersonTypes';

describe('Domain :: UseCases :: Movidesk :: mapMovideskPersonDataFromParticipanteUseCase', () => {

  test(
    `
      Should throw custom exception if no (participante) object is received
    `,
    async (done) => {
      try {
        await mapMovideskPersonDataFromParticipanteUseCase(
          null,
          null
        );

        expect('not').toBe('here');

      } catch (error) {
        expect(error.message).toBe('missing-document');
      }

      done();
    }
  );

  test(
    `
      Should return mapped person object for Movidesk Integration
      using received (participante) object
    `,
    async (done) => {
      try {
        const participante = {
          id: 13,
          ativo: true,
          documento: '01510345000158',
          razaoSocial: 'Razão Social Ltda.',
          nome: 'Empresa Fantasia Nome =)',
          cep: '04533-010',
          cidade: {
            estado: 'SP',
            nome: 'São Paulo'
          },
          bairro: 'Itaim Bibi',
          logradouro: 'Rua Tabapuã',
          numero: '145',
          complemento: '9° Andar',
          telefone: '1130444068',
          contatos: [
            {
              celular: '11912344321',
              email: 'luiz.santos@itlab.com.br'
            }
          ]
        };
        const userEmail = 'alpe@alpe.com.br';

        const person = await mapMovideskPersonDataFromParticipanteUseCase(
          participante,
          userEmail
        );

        expect(person).toBeTruthy();

        expect(person.id.length).toBe(36);
        expect(person.codeReferenceAdditional).toBe(participante.id);
        expect(person.isActive).toBe(participante.ativo);
        expect(person.personType).toBe(MovideskTipoPessoa.Empresa);
        expect(person.profileType).toBe(MovideskTipoPerfil.Cliente);
        expect(person.accessProfile).toBe('');
        expect(person.corporateName).toBe(participante.razaoSocial);
        expect(person.businessName).toBe(participante.nome);
        expect(person.cpfCnpj).toBe(participante.documento);
        expect(person.userName).toBe(participante.documento);
        expect(person.password).toBe(participante.documento);
        expect(person.cultureId).toBe('pt-BR');
        expect(person.timeZoneId).toBe('America/Sao_Paulo');
        expect(person.createdDate).toBeTruthy();
        expect(person.createdBy).toBe(userEmail);
        expect(person.observations).toBe(person.id);

        expect(person.addresses.length).toBe(1);
        expect(person.addresses[0].addressType).toBe('Comercial');
        expect(person.addresses[0].country).toBe('Brasil');
        expect(person.addresses[0].postalCode).toBe(participante.cep);
        expect(person.addresses[0].state).toBe(participante.cidade.estado);
        expect(person.addresses[0].city).toBe(participante.cidade.nome);
        expect(person.addresses[0].district).toBe(participante.bairro);
        expect(person.addresses[0].street).toBe(participante.logradouro);
        expect(person.addresses[0].number).toBe(participante.numero);
        expect(person.addresses[0].complement).toBe(participante.complemento);
        expect(person.addresses[0].reference).toBe('');
        expect(person.addresses[0].isDefault).toBe(true);

        expect(person.contacts.length).toBe(2);
        expect(person.contacts[0].contactType).toBe('Telefone');
        expect(person.contacts[0].contact).toBe(participante.telefone);
        expect(person.contacts[0].isDefault).toBe(true);
        expect(person.contacts[1].contactType).toBe('Celular');
        expect(person.contacts[1].contact).toBe(participante.contatos[0].celular);
        expect(person.contacts[1].isDefault).toBe(false);

        expect(person.emails.length).toBe(1);
        expect(person.emails[0].emailType).toBe('Profissional');
        expect(person.emails[0].email).toBe(participante.contatos[0].email);
        expect(person.emails[0].isDefault).toBe(true);

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
