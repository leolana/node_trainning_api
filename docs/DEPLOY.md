# Modelo GMUD
---

## Informações

* 1- API, TAG do container (obter no CIRCLE CI)
* 2- TAG no GIT
* 3- `tree` listando os scripts que serão executados (junto com os links)
* 4- Front, Nome do zip que o último passo do job `compress-s3` 
  * executa no CI exemplo: (https://circleci.com/bb/timefinanceiro/alpe-credenciamento-front/****) chama `dist-YYYYMMDD.zip`
* 5- SISCOF-ARTIFACTS PRECISA seguir a mesma logica com branch stable e TAG de versao
* 6- Versão que estamos instalando `1.*.*`
---

## Execução

---

```Requisitos:

- Possuir as configurações de conexão ao SISCOF como MASTER
- Possuir o Dbeaver e SqlDeveloper instalados
- Dbeaver configurado para conectar a base de Credenciamento/Securitizacao
- SqlDeveloper configurado para conectar a base do SISCOF
- Id CloudFront da distribuicao de Securitizacao/Credenciamento

0. Efetuar Snapshot da base de dados RDS de securitização
1. Efetuar Snapshot da base ORACLE do SISCOF (Conta AWS Yandeh)

Apos a conclusao dos snapshots:

Baixar/Atualizar os 2 Repositorios:
- https://bitbucket.org/timefinanceiro/alpe-credenciamento-back/src/stable/scripts/********/
- https://bitbucket.org/timefinanceiro/alpe-siscof-artifacts/src/develop/********

2. Executar os scripts do repositorio, na ordem abaixo:

SCRIPTS PG na BASE de Credenciamento/Securitizacao:
- Executar cada script no DBeaver -> abrir arquivo -> se certificar que esta conectado a base do Credenciamento/Securitizacao -> Apertar CTRL+ENTER
Na branch STABLE -> https://bitbucket.org/timefinanceiro/alpe-credenciamento-back/src/stable/scripts/*********/

├── 01.script-1.sql
├── 02.script-2.sql
├── 03.script-3.sql
├── 04.script-4.sql
├── 99.script-5.sql

SCRIPTS ORACLE na Base do SISCOF:
- Executar utilizando o SqlDeveloper -> Abrir o arquivo -> se certificar que esta conectado a base do SISCOF (Schema Yandeh) -> Apertar F5
Na Branch DEVELOP -> https://bitbucket.org/timefinanceiro/alpe-siscof-artifacts/src/develop/**********/

├── 00.script-0.sql
└── cessao
    ├── 01.script-1.sql
    ├── 02.script-2.sql
    ├── 03.script-3.sql
    ├── 04.script-4.sql
    └── 05.script-5.sql

3. Enviar o resultado ao responsavel para validação antes de executar os demais passos.

4. Realizar download do script de deploy em produção Alpe deploy-prd-alpe.sh (Alpe homologação S3 Bucket: alpe-agent-pci)
4.1 Executar script com os dados associados as versões:

./deploy-prd-alpe.sh ********** alpe-securitizacao-api-dev alpe-securitizacao-api-prd alpe-securitizacao alpe-hml alpe-prd

5. Atualização do sistema de securitização front-end, (S3 files):

Realizar download do pacote dist-201900000.zip do S3 de bundles (alpe-credenciamento-front-bundles - Alpe Homologação) e extrair para uma pasta local

$ cd .dist/

- Trocar os `[ID DA DISTRO CLOUDFRONT]` no `distribution-id` pelo Id de producao
$ aws --profile alpe-prd s3 sync --delete . s3://alpe-distribution-prd/ && aws --profile alpe-prd cloudfront create-invalidation --distribution-id [ID DA DISTRO CLOUDFRONT] --paths '/*'

6. Acompanhar na console o termino da invalidacao e avisar o time.```
ROLLBACK/RETORNO:
```Em caso de problemas avisar o responsavel antes de executar procedimento abaixo.

SCRIPTS PG na BASE de Credenciamento/Securitizacao:
- Executar cada script no DBeaver -> abrir arquivo -> se certificar que esta conectado a base do Credenciamento/Securitizacao -> Apertar CTRL+ENTER
└── rollback
    ├── 01.script-1.rollback.sql
    ├── 02.script-2.rollback.sql
    ├── 03.script-3.rollback.sql
    └── 04.script-4-rollback.sql

Realizar o rollback para a versão 1.6.1
1. Realizar download do script de deploy em produção Alpe deploy-prd-alpe.sh (Alpe homologação S3 Bucket: alpe-agent-pci)
1.1 Executar script com os dados associados as versões:

./deploy-prd-alpe.sh 20190******* alpe-securitizacao-api-dev alpe-securitizacao-api-prd alpe-securitizacao alpe-hml alpe-prd

3. Atualização do sistema de securitização front-end, (S3 files):

Realizar download do pacote dist-201900000.zip do S3 de bundles (alpe-credenciamento-front-bundles - Alpe Homologação) e extrair para uma pasta local

$ cd .dist/

- Trocar os `[ID DA DISTRO CLOUDFRONT]` no `distribution-id` pelo Id de producao
$ aws --profile alpe-prd s3 sync --delete . s3://alpe-distribution-prd/ && aws --profile alpe-prd cloudfront create-invalidation --distribution-id [ID DA DISTRO CLOUDFRONT] --paths '/*'

4. Acompanhar na console o termino da invalidação e avisar o time.```

---
