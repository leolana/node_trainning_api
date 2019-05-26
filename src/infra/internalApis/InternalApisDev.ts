import { injectable } from 'inversify';

import InternalApis from './InternalApis';

@injectable()
class InternalApisDev implements InternalApis {
  obterBancos = () => {
    const bancos = [
      { id: '246', text: 'Banco ABC Brasil S.A.' },
      { id: '075', text: 'Banco ABN AMRO S.A.' },
    ];
    return Promise.resolve(bancos);
  }

  obterEndereco = (cep) => {
    const endereco = {
      cep,
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      cidadeId: 3,
      complemento: '',
      complemento2: '',
      end: 'Rua Tabapuã',
      id: '0',
      uf: 'SP',
    };
    return Promise.resolve(endereco);
  }
}

export default InternalApisDev;
