# ALPE ENV VARIABLES

- [ALPE ENV VARIABLES](#alpe-env-variables)
    - [Intro](#intro)
    - [Inputs](#inputs)
    - [Outputs](#outputs)
    - [Authors](#authors)

## Intro

Manual das variáveis de ambiente da api de securitização.

## Inputs

#### ALPE_CONNECTION_STRING:
**Description:** Variável responsável por indicar a string de conexão com o banco de dados.

**Format:** protocolo_de_conexao://usuario:senha@conexao:porta/banco_de_dados

**Possible values:**  
*protocolo_de_conexao:* postgres  
*usuario:* admin  
*senha:* admin  
*conexao:* localhost  
*porta:* 1234  
*banco_de_dados:* alpe_db

**Example:** `ALPE_CONNECTION_STRING: postgres://localhost:alpe123@127.0.0.1:1234/alpe_db`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_KEYCLOAK_ADDRESS:
**Description:** Variável responsável por indicar o endereço de conexão do keycloack.

**Format:** protocolo_http://endereco_de_conexao

**Possible values:**  
*protocolo_http:* https  
*endereco_de_conexao:* alpe-keycloak.yandeh.[]()com.[]()br/keycloak

**Example:** `ALPE_KEYCLOAK_ADDRESS: https://alpe-keycloak.yandeh.com.br/keycloak`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_KEYCLOAK_CLIENT_ID:
**Description:** Variável responsável por indicar o id do cliente.

**Format:** id

**Possible values:**  
*id:* alpe-bko

**Example:** `ALPE_KEYCLOAK_CLIENT_ID: alpe-bko`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_KEYCLOAK_CLIENT_SECRET:
**Description:** Variável responsável por indicar a chave secreta do cliente.

**Format:** chave

**Possible values:**  
*chave:* admin

**Example:** `ALPE_KEYCLOAK_CLIENT_SECRET: 'admin'`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_KEYCLOAK_PUBLIC_KEY:
**Description:** Variável responsável por indicar a chave pública do cliente.

**Format:** chave

**Possible values:**  
*chave:* admin

**Example:** `ALPE_KEYCLOAK_PUBLIC_KEY: 'admin'`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_STORAGE_REGION:
**Description:** Variável responsável por indicar a região do endpoint do serviço de armazenamento de arquivos da AWS.

**Format:** localizacao_da_regiao

**Possible values:**  
*localizacao_da_regiao:* us-east-x | us-west-x | ap-northeast-x | ap-southeast-x | ca-central-x | cn-north-x | cn-northwest-x | eu-central-x | eu-west-x | eu-north-x | sa-east-x  
  
*obs:* As letras 'x' devem ser substituidas pelo número referente ao storage da região contratada

**Example:** `ALPE_STORAGE_REGION: us-east-1`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_STORAGE_BUCKET:
**Description:** Variável responsável por indicar o nome do bucket usado para armazenamento de arquivos na AWS.

**Format:** nome_do_bucket

**Possible values:**  
*nome_do_bucket:* alpe-credenciamento

**Example:** `ALPE_STORAGE_BUCKET: alpe-credenciamento`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_SES_REGION:
**Description:** Variável responsável por indicar a região do endpoint do serviço de e-mail da AWS.

**Format:** localizacao_da_regiao

**Possible values:**
*localizacao_da_regiao:* us-west-x | us-east-x | eu-west-x  
  
*obs:* As letras 'x' devem ser substituidas pelo número referente ao storage da região contratada

**Example:** `ALPE_SES_REGION: us-west-2`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_APIS_BANCOS_ADDRESS:
**Description:** Variável responsável por indicar o endereço de conexão com o banco das apis.

**Format:** protocolo_http://endereco_de_conexao

**Possible values:**  
*protocolo_http:* http  
*endereco_de_conexao:* alpe-api-banco.aws-elastic.[]()com.[]()br/alpe-db

**Example:** `ALPE_APIS_BANCOS_ADDRESS: http://alpe-api-banco.aws-elastic.com.br/alpe-db`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_APIS_CEPS_ADDRESS:
**Description:** Variável responsável por indicar o endereco da api de CEPs.

**Format:** protocolo_http://endereco_do_ceps

**Possible values:**  
*protocolo_http:* http  
*endereco_do_ceps:* alpe-api-ceps.aws-elastic.[]()com.[]()br/alpe-ceps

**Example:** `http://alpe-api-ceps.aws-elastic.com.br/alpe-ceps`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_SISCOF_USER:
**Description:** Variável responsável por indicar o usuario de acesso ao siscof.

**Format:** usuario

**Possible values:**  
*usuario:* itlab

**Example:** `ALPE_SISCOF_USER: "itlab"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_SISCOF_PASSWORD:
**Description:** Variável responsável por indicar a senha de acesso ao siscof.

**Format:** senha

**Possible values:**  
*senha:* admin

**Example:** `ALPE_SISCOF_PASSWORD: "admin"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

####  ALPE_SISCOF_CONNECTSTRING:
**Description:** Variável responsável por indicar a string de conexão do siscof.

**Format:** endereco:porta/nome_do_banco

**Possible values:**  
*endereco:* 127.0.0.1  
*porta:* 1234  
*nome_do_banco:* siscof_db

**Example:** `ALPE_SISCOF_CONNECTSTRING: 127.0.0.1:1234/siscof-db`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_KEYCLOAK_ADMIN_USERNAME:
**Description:** Variável responsável por indicar o nome de usuario de acesso do administrador do keycloack.

**Format:** usuario

**Possible values:**  
*usuario:* admin

**Example:** `ALPE_KEYCLOAK_ADMIN_USERNAME: "admin"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_KEYCLOAK_ADMIN_PASSWORD:
**Description:** Variável responsável por indicar o a senha de acesso do administrador do keycloack.

**Format:** senha

**Possible values:**  
*senha:* admin

**Example:** `ALPE_KEYCLOAK_ADMIN_PASSWORD: "admin"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_KEYCLOAK_CLIENT_UUID:
**Description:** Variável responsável por indicar o UUID de acesso do keycloack.

**Format:** uuid

**Possible values:**  
*uuid:* admin

**Example:** `ALPE_KEYCLOAK_CLIENT_UUID: "admin"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_KEYCLOAK_REALM:
**Description:** Variável responsável por indicar o realm de acesso do keycloack.

**Format:** realm

**Possible values:**  
*realm:* admin

**Example:** `ALPE_KEYCLOAK_REALM: "admin"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_APIS_FINANCIAL_LOGIN:
**Description:** Variável responsável por indicar o login financeiro de acesso da api.

**Format:** login

**Possible values:**  
*login:* admin

**Example:** `ALPE_APIS_FINANCIAL_LOGIN: "admin"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_APIS_FINANCIAL_PWD:
**Description:** Variável responsável por indicar a senha financeira de acesso da api.

**Format:** senha

**Possible values:**  
*senha:* admin

**Example:** `ALPE_APIS_FINANCIAL_PWD: "admin"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_APIS_FINANCIAL_ADDRESS:
**Description:** Variável responsável por indicar o endereco financeiro de acesso da api.

**Format:** endereco

**Possible values:**  
*endereco:* admin

**Example:** `ALPE_APIS_FINANCIAL_ADDRESS: "admin"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_LOGS_STDOUT_LEVEL:
**Description:** Variável responsável por indicar a severidade do log de saída da api.

**Format:** level

**Possible values:**  
*level:* SILLY | DEBUG | VERBOSE | INFO | WARN | ERROR

**Example:** `ALPE_LOGS_STDOUT_LEVEL: "INFO"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | info | false | false |

---

#### ALPE_LOGS_STDERR_LEVEL:
**Description:** Variável responsável por indicar a severidade do log de erro da api.

**Format:** level

**Possible values:**  
*level:* ERROR

**Example:** `ALPE_LOGS_STDERR_LEVEL: "ERROR"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | error | false | false |

---

#### ALPE_MAILER_ORIGIN:
**Description:** Variável responsável por indicar o e-mail origem dos envios de e-mail.

**Format:** nome_de_email@dominio_de_email

**Possible values:**  
*nome_de_email:* mailer  
*dominio_de_email:* itlab.[]()com.[]()br

**Example:** `ALPE_MAILER_ORIGIN: mailer@itlab.com.br`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_URL:
**Description:** Variável responsável por indicar o endereço de acesso ao portal backoffice.

**Format:** protocolo_http://endereco:porta

**Possible values:**  
*protocolo_http:* http | https  
*endereco:* localhost  
*porta:* 1234

**Example:** `ALPE_URL: "http://localhost:1234"`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_DATABASE_SYNC:
**Description:** Variável responsável por indicar se os schemas do banco serão gerados a cada rodagem da aplicação.

**Format:** sync

**Possible values:**  
*sync:* true | false

**Example:** `ALPE_DATABASE_SYNC: false`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| boolean | - | true | false |

---

#### ALPE_MAILING_LIST:
**Description:** Variável responsável por indicar a lista de e-mails administrativos do sistema.

**Format:** nome_de_email@dominio_do_email

**Possible values:**  
*nome_de_email:* mailer  
*dominio_do_email:* itlab.[]()com.[]()br

**Example:** `ALPE_MAILING_LIST: mailer@itlab.com.br`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_SENTRY_DSN:
**Description:** Variável responsável por indicar o DNS do sentry da api.

**Format:** procotolo_http://dominio_do_sentry

**Possible values:**  
*protocolo_http:* https  
*dominio_do_sentry:* 367453267@[]()sentry.[]()io/1234

**Example:** `ALPE_SENTRY_DSN: 'https://367453267@sentry.io/1234'`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

#### ALPE_MOVIDESK_TOKEN:
**Description:** Variável responsável por indicar o token de integração com o Movidesk.

**Format:** token

**Possible values:**
*token:* dca7ac49-71a3-45dc-a5f5-3317e78ec587

**Example:** `ALPE_MOVIDESK_TOKEN: 'dca7ac49-71a3-45dc-a5f5-3317e78ec587'`

| Type | Default | Required | Crypto |
|:---:|:---:|:---:|:---:|
| string | - | true | false |

---

## Outputs

#### ALPE_CONNECTION_STRING:
**Description:**  
*protocolo_de_conexao incorreto:* Error: The dialect postges is not supported. Supported dialects: mssql, mysql, postgres, and sqlite  
  
*senha incorreta:* Could not connect to Main-DB. SequelizeConnectionError: password authentication failed for user "postgres"  
  
*usuario incorreto:* Could not connect to Main-DB. SequelizeConnectionError: password authentication failed for user "pstgres"  
  
*conexao incorreta:* Could not connect to Main-DB. SequelizeHostNotFoundError: getaddrinfo ENOTFOUND localost localost:5432  
  
*porta incorreta:* Could not connect to Main-DB. SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:5422  
  
*banco_de_dados incorreto:* Could not connect to Main-DB. SequelizeConnectionError: database "ale" does not exist

---

#### ALPE_KEYCLOAK_ADDRESS:
**Description:**  
*protocolo_http incorreto:* {"name":"RequestError","message":"Error: Invalid protocol: htp:","cause":{},"error":{},"options":{"method":"POST","uri":"htp://localhost:8080/auth/realms/alpe/protocol/openid-connect/token","form":{"client_id":"admin-cli","username":"admin","password":"admin","grant_type":"password"},"simple":true,"resolveWithFullResponse":false,"transform2xxOnly":false},"level":"error","timestamp":"2019-02-08T16:23:48.081Z"}  
{"message":"restify listening at http://[::]:8081","level":"info","timestamp":"2019-02-08T16:23:48.083Z"}  
  
*endereco_de_conexao incorreto:* {"name":"RequestError","message":"Error: getaddrinfo ENOTFOUND localhot localhot:8080","cause":{"errno":"ENOTFOUND","code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"localhot","host":"localhot","port":"8080"},"error":{"errno":"ENOTFOUND","code":"ENOTFOUND","syscall":"getaddrinfo","hostname":"localhot","host":"localhot","port":"8080"},"options":{"method":"POST","uri":"http:/[]()/localhot:8080/auth/realms/alpe/protocol/openid-connect/token","form":{"client_id":"admin-cli","username":"admin","password":"admin","grant_type":"password"},"simple":true,"resolveWithFullResponse":false,"transform2xxOnly":false},"level":"error","timestamp":"2019-02-08T16:21:22.021Z"}

---

#### ALPE_KEYCLOAK_CLIENT_ID:
**Description:**  
*id incorreto:* WARN  [org.keycloak.events] (default task-55) type=LOGIN_ERROR, realmId=alpe-bko, clientId=alpe-bo, userId=null, ipAddress=127.0.0.1, error=invalid_client_credentials, grant_type=password

---

#### ALPE_KEYCLOAK_CLIENT_SECRET:
**Description:**  
*chave incorreta:* WARN  [org.keycloak.events] (default task-55) type=LOGIN_ERROR, realmId=alpe-bko, clientId=alpe-bko, userId=null, ipAddress=127.0.0.1, error=invalid_client_credentials, grant_type=password

---

#### ALPE_KEYCLOAK_PUBLIC_KEY:
**Description:**  
*chave incorreta:* TypeError: restify.InvalidCredentialsError is not a constructor at /home/itlab/source/repos/alpe/alpe-api/node_modules/restify-jwt/lib/index.js:101:53 at /home/itlab/source/repos/alpe/alpe-api/node_modules/restify-jwt/node_modules/jsonwebtoken/index.js:155:18 at process._tickCallback (internal/process/next_tick.js:61:11)

---

#### ALPE_STORAGE_REGION:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_STORAGE_BUCKET:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_SES_REGION:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_APIS_BANCOS_ADDRESS:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_APIS_CEPS_ADDRESS:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_SISCOF_USER:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_SISCOF_PASSWORD:
**Description:**  
Essa variável não possui output na aplicação.

---

####  ALPE_SISCOF_CONNECTSTRING:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_KEYCLOAK_ADMIN_USERNAME:
**Description:**  
*usuario:* WARN  [org.keycloak.events] (default task-55) type=LOGIN_ERROR, realmId=alpe-bko, clientId=admin-cli, userId=null, ipAddress=127.0.0.1, error=invalid_user_credentials, auth_method=openid-connect, grant_type=password, client_auth_method=client-secret, username=admi

---

#### ALPE_KEYCLOAK_ADMIN_PASSWORD:
**Description:**  
*senha:* WARN  [org.keycloak.events] (default task-55) type=LOGIN_ERROR, realmId=alpe-bko, clientId=admin-cli, userId=49af4843-0421-4a0a-a949-6a55d516aebc, ipAddress=127.0.0.1, error=invalid_user_credentials, auth_method=openid-connect, grant_type=password, client_auth_method=client-secret, username=admin

---

#### ALPE_KEYCLOAK_CLIENT_UUID:
**Description:**  
*uuid incorreto:* {"name":"StatusCodeError","statusCode":404,"message":"404 - undefined","options":{"method":"GET","uri":"http:/[]()/localhost:8080/auth/admin/realms/alpe/clients/04a6ede8a-f58d-4102-974a-f8b5c7c70652/roles","headers":{"Authorization":"Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhN2IzQzRwWlMxQXZnWXEybXRKZHBXdGZLaVhCbGhrUElIVUxhaHY1XzQ0In0.eyJqdGkiOiI5M2VmYWQ1ZS1hOWNmLTQ3ZWItOGY0Ni0xZGEzODBjMzhkOGYiLCJleHAiOjE1NDk2NDc2ODYsIm5iZiI6MCwiaWF0IjoxNTQ5NjQ3Mzg2LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9yZWFsbXMvYWxwZSIsInN1YiI6IjQ5YWY0ODQzLTA0MjEtNGEwYS1hOTQ5LTZhNTVkNTE2YWViYyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFkbWluLWNsaSIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjQ3ZGIxNmU4LWU0MDktNGQ4Yi04YzU4LThmYzc1ZGI3OTQwMyIsImFjciI6IjEiLCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluIn0.WY1cPl26VbRLiK-x7CqIl4IC0YsFZ8IfkRuHBpuyhFRQjeoZfodX3TyZP7zyxno0Ao9W5u3Rr0YDpfm1my8BH7ELnE3fFnje61wEJF4klWgsUxplMmqWwpXy_PzqYaBG9PyTLNJrL-CoCuFoxBo2mFL-nHi65aOJo1jukO15XEDWX1F8hPfJ2Ipyi2moQH4ScMXrbfxnkNkZm5YpxaHCXnsTlPjGSO5HSE_qDuNqR7zLv1VC8TLi14oRIKg-v8sLMlsKiDGg-MmA6fIYVt30Vl21oLCu-Nvk78WxPh3Inb9GA4YkBwQ8ITzbkDE_8OPNQurHfW9lGr9nm2G9hm8Dgg"},"json":true,"simple":true,"resolveWithFullResponse":false,"transform2xxOnly":false},"response":{"statusCode":404,"headers":{"connection":"close","content-length":"0","date":"Fri, 08 Feb 2019 17:36:26 GMT"},"request":{"uri":{"protocol":"http:","slashes":true,"auth":null,"host":"localhost:8080","port":"8080","hostname":"localhost","hash":null,"search":null,"query":null,"pathname":"/auth/admin/realms/alpe/clients/04a6ede8a-f58d-4102-974a-f8b5c7c70652/roles","path":"/auth/admin/realms/alpe/clients/04a6ede8a-f58d-4102-974a-f8b5c7c70652/roles","href":"http:/[]()/localhost:8080/auth/admin/realms/alpe/clients/04a6ede8a-f58d-4102-974a-f8b5c7c70652/roles"},"method":"GET","headers":{"Authorization":"Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhN2IzQzRwWlMxQXZnWXEybXRKZHBXdGZLaVhCbGhrUElIVUxhaHY1XzQ0In0.eyJqdGkiOiI5M2VmYWQ1ZS1hOWNmLTQ3ZWItOGY0Ni0xZGEzODBjMzhkOGYiLCJleHAiOjE1NDk2NDc2ODYsIm5iZiI6MCwiaWF0IjoxNTQ5NjQ3Mzg2LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXV0aC9yZWFsbXMvYWxwZSIsInN1YiI6IjQ5YWY0ODQzLTA0MjEtNGEwYS1hOTQ5LTZhNTVkNTE2YWViYyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFkbWluLWNsaSIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjQ3ZGIxNmU4LWU0MDktNGQ4Yi04YzU4LThmYzc1ZGI3OTQwMyIsImFjciI6IjEiLCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInByZWZlcnJlZF91c2VybmFtZSI6ImFkbWluIn0.WY1cPl26VbRLiK-x7CqIl4IC0YsFZ8IfkRuHBpuyhFRQjeoZfodX3TyZP7zyxno0Ao9W5u3Rr0YDpfm1my8BH7ELnE3fFnje61wEJF4klWgsUxplMmqWwpXy_PzqYaBG9PyTLNJrL-CoCuFoxBo2mFL-nHi65aOJo1jukO15XEDWX1F8hPfJ2Ipyi2moQH4ScMXrbfxnkNkZm5YpxaHCXnsTlPjGSO5HSE_qDuNqR7zLv1VC8TLi14oRIKg-v8sLMlsKiDGg-MmA6fIYVt30Vl21oLCu-Nvk78WxPh3Inb9GA4YkBwQ8ITzbkDE_8OPNQurHfW9lGr9nm2G9hm8Dgg","accept":"application/json"}}},"level":"error","timestamp":"2019-02-08T17:36:26.142Z"}

---

#### ALPE_KEYCLOAK_REALM:
**Description:**  
*realm:* {"name":"StatusCodeError","statusCode":404,"message":"404 - \"\"","error":"","options":{"method":"POST","uri":"http:/[]()/localhost:8080/auth/realms/alp/protocol/openid-connect/token","form":{"client_id":"admin-cli","username":"admin","password":"admin","grant_type":"password"},"simple":true,"resolveWithFullResponse":false,"transform2xxOnly":false},"response":{"statusCode":404,"body":"","headers":{"connection":"close","content-length":"0","date":"Fri, 08 Feb 2019 17:30:59 GMT"},"request":{"uri":{"protocol":"http:","slashes":true,"auth":null,"host":"localhost:8080","port":"8080","hostname":"localhost","hash":null,"search":null,"query":null,"pathname":"/auth/realms/alp/protocol/openid-connect/token","path":"/auth/realms/alp/protocol/openid-connect/token","href":"http:/[]()/localhost:8080/auth/realms/alp/protocol/openid-connect/token"},"method":"POST","headers":{"content-type":"application/x-www-form-urlencoded","content-length":69}}},"level":"error","timestamp":"2019-02-08T17:30:59.853Z"}

---

#### ALPE_APIS_FINANCIAL_LOGIN:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_APIS_FINANCIAL_PWD:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_APIS_FINANCIAL_ADDRESS:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_LOGS_STDOUT_LEVEL:
**Description:**  
*silly:* {"message":"Log usado para mostrar alguma informação sem relevância","level":"debug","timestamp":"2019-02-11T13:30:27.201Z"}  
  
*debug:* {"message":"Log usado para debugar e verificar algum dado","level":"debug","timestamp":"2019-02-11T13:23:31.208Z"}  
  
*info:* {"message":"Log usado para mostrar alguma informação relevante","level":"info","timestamp":"2019-02-11T13:19:56.901Z"}  
  
*warn:* {"message":"Log usado para informar algum dado ou operação inválido","level":"warn","timestamp":"2019-02-11T13:19:56.901Z"}

---

#### ALPE_LOGS_STDERR_LEVEL:
**Description:**  
*error:* {"message":"Log usado para informar algum erro no sistema","level":"error","timestamp":"2019-02-11T13:26:17.494Z"}

---

#### ALPE_MAILER_ORIGIN:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_URL:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_DATABASE_SYNC:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_MAILING_LIST:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_SENTRY_DSN:
**Description:**  
Essa variável não possui output na aplicação.

---

#### ALPE_MOVIDESK_TOKEN:
**Description:**
Essa variável não possui output na aplicação.

---

#### ALPE_APIS_MOVIDESK:
**Description:**
Essa variável não possui output na aplicação.

---

**OBS: Todos os campos referentes a nome de usuário, senha, endereco, porta e afins são meramente ilustrativos, substitua os valores pelos respectivos dados do seu sistema**

### Authors

* Made with ♥ by ITLAB (http://www.itlab.com.br)
