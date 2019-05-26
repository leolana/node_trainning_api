import * as request from 'request-promise-native';
import { injectable } from 'inversify';

import { config } from '../../config';
import InternalApis from './InternalApis';
import { CepNotFoundException } from '../../interfaces/rest/exceptions/ApiExceptions';

@injectable()
class InternalApisProd implements InternalApis {
  private settings: any;

  constructor() {
    this.settings = config.internalApis;
  }

  obterBancos = () => {
    return request({ uri: this.settings.addressBancos })
      .then(result => JSON.parse(result))
      .then(bancos => bancos.map(b => ({
        id: b.Comp,
        text: b.Banco
      })));
  }

  obterEndereco = (cep) => {
    return request({ uri: `${this.settings.addressCEPs}/${cep}` })
      .then(result => JSON.parse(result))
      .catch((error) => {
        throw new CepNotFoundException();
      });
  }

  obterFinanceiroBandeiras = () => {
    const options = {
      method: 'GET',
      uri: `${this.settings.financial.address}/brand-card`,
      headers: {
        Authorization: `Basic ${this.settings.financial.auth}`
      },
      json: true
    };

    return request(options);
  }

  obterTipoOperacao = () => {
    const options = {
      method: 'GET',
      uri: `${this.settings.financial.address}/operation-type`,
      headers: {
        Authorization: `Basic ${this.settings.financial.auth}`
      },
      json: true
    };

    return request(options);
  }
  obterTransacoesResumo = (document) => {
    const options = {
      method: 'POST',
      uri: `${this.settings.financial.address}/transaction/resume`,
      headers: {
        Authorization: `Basic ${this.settings.financial.auth}`
      },
      body: {
        document
      },
      json: true
    };

    return request(options);
  }
  obterFinanceiroAnalitico = (document, filters) => {
    const options = {
      method: 'POST',
      uri: `${this.settings.financial.address}/analytical`,
      headers: {
        Authorization: `Basic ${this.settings.financial.auth}`
      },
      body: {
        document
      },
      json: true
    };

    if (filters) {
      options.body = Object.assign(filters, options.body);
    }

    return request(options);
  }
}

export default InternalApisProd;
