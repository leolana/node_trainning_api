module.exports = di => {
    di.provide('@credenciamento-arquivos.schemas', () => {
        let fichaCadastro = {
            type: 'string',
            max: 250,
            required: false
        };

        let extratosBancarios = {
            type: 'array',
            of: {
                type: 'string',
                max: 250,
                required: true
            },
            required: true,
            min: 1
        };

        let analises = {
            type: 'array',
            of: 'json',
            attributes: {
                id: {
                    type: 'integer',
                },
                arquivo: {
                    type: 'string',
                },
                observacao: {
                    type: 'string',
                },
                usuario: {
                    type: 'string',
                },
                createdAt: {
                    type: 'string',
                },
                updatedAt: {
                    type: 'string',
                },
            },
            required: false,
            min: 0,
        };

        return Promise.resolve({
            pessoaFisica: proposta => {
                let schema = {
                    identidade: {
                        type: 'string',
                        max: 250,
                        required: true
                    },
                    comprovanteDeResidencia: {
                        type: 'string',
                        max: 250,
                        required: true
                    },
                    extratosBancarios: extratosBancarios,
                    analises: analises,
                };

                if (proposta)
                    schema.fichaCadastro = fichaCadastro;

                return schema;
            },
            pessoaJuridica: proposta => {
                let schema = {
                    contratoSocial: {
                        type: 'string',
                        max: 250,
                        required: true
                    },
                    extratosBancarios: extratosBancarios,
                    analises: analises,
                };

                if (proposta)
                    schema.fichaCadastro = fichaCadastro;

                return schema;
            }
        });
    });
}