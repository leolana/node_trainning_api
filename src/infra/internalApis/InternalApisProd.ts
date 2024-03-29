import * as request from 'request-promise-native';
import { injectable, inject } from 'inversify';

import InternalApis from './InternalApis';
import { Environment, InternalApiEnv } from '../environment/Environment';
import { CepNotFoundException } from '../../interfaces/rest/exceptions/ApiExceptions';

import types from '../../constants/types';

@injectable()
class InternalApisProd implements InternalApis {
  private settings: InternalApiEnv;

  constructor(
    @inject(types.Environment) config: Environment
  ) {
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
