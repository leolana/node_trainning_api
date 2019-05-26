let request = require('request-promise-native');

module.exports = di => {
    di.provide('$internal-apis', '@internal-apis-settings', (settings) => {
        return Promise.resolve({
            obterBancos: () => {
                return request({ uri: settings.addressBancos })
                    .then(result => JSON.parse(result))
                    .then(bancos => bancos.map(b => ({
                        id: b.Comp,
                        text: b.Banco
                    })));
            },
            obterEndereco: (cep) => {
                return request({ uri: `${settings.addressCEPs}/${cep}` })
                    .then(result => JSON.parse(result))
                    .catch((error) => {
                        throw 'cep-not-found';
                    })
            },
            obterFinanceiroBandeiras: () => {
                const options = {
                    method: 'GET',
                    uri: `${settings.financial.address}/brand-card`,
                    headers: {
                        Authorization: `Basic ${settings.financial.auth}`
                    },
                    json: true
                }
                return request(options);
            },
            obterTipoOperacao: () => {
                const options = {
                    method: 'GET',
                    uri: `${settings.financial.address}/operation-type`,
                    headers: {
                        Authorization: `Basic ${settings.financial.auth}`
                    },
                    json: true
                }
                return request(options);
            },
            obterTransacoesResumo: (document) => {
                const options = {
                    method: 'POST',
                    uri: `${settings.financial.address}/transaction/resume`,
                    headers: {
                        Authorization: `Basic ${settings.financial.auth}`
                    },
                    body: {
                        document: document
                    },
                    json: true
                }
                return request(options);
            },
            obterFinanceiroAnalitico: (document, filters) => {
                const options = {
                    method: 'POST',
                    uri: `${settings.financial.address}/analytical`,
                    headers: {
                        Authorization: `Basic ${settings.financial.auth}`
                    },
                    body: {
                        document: document
                    },
                    json: true
                }

                if (filters)
                    options.body = Object.assign(filters, options.body)

                return request(options);
            }
        });
    });
};
