let Sequelize = require('sequelize');

module.exports = di => {
    di.provide('@credenciamento-proposta.entities', '@@tipos-pessoa', '@credenciamento-arquivos.schemas', '$validator', (tiposPessoa, schemas, $validator) => {
        let _tiposPessoa = [];

        for (let t in tiposPessoa)
           _tiposPessoa.push(tiposPessoa[t]);

        return Promise.resolve({
            identity: 'credenciamentoProposta',
            attributes: {
                tipoPessoa: {
                    type: Sequelize.SMALLINT,
                    allowNull: false,
                    validate: {
                        isIn: [_tiposPessoa]
                    }
                },
                documento: {
                    type: Sequelize.STRING(18),
                    allowNull: false
                },
                nome: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                arquivos: {
                    type: Sequelize.JSONB
                },
                participanteId: {
                    type: Sequelize.INTEGER,
                    allowNull: false
                },
                usuario: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
            },
            associations: {
                belongsTo: {
                    participante: { sourceKey: 'participanteId'},
                }
            },
            validations: {
                verificarArquivos() {
                    let schema = this.tipoPessoa == tiposPessoa.fisica
                               ? schemas.pessoaFisica(true)
                               : schemas.pessoaJuridica(true);

                    if (!$validator.check(schema, this.arquivos))
                        throw 'invalid-sent-data';
                }
            }
        });
    });
}
