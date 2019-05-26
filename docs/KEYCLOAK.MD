# Configuração do Keycloak

Para realizar os testes integrados de criação e manutenção dos usuários, é necessário instalar, configurar e executar o servidor do Keycloak localmente no ambiente de desenvolvimento.

[Guia oficial](https://www.keycloak.org/docs/latest/getting_started/index.html)

## Instalação

Baixe o servidor na [seção de downloads do Keycloak](https://www.keycloak.org/downloads.html).

Extraia o arquivo:
* Linux: `unzip keycloak-4.8.1.Final.zip` ou `tar -xvzf keycloak-4.8.1.Final.tar.gz`
* Windows: `unzip keycloak-4.8.1.Final.zip` ou extraia via Explorer.

Na pasta extraída, abra a pasta **bin**.

Inicie o servidor:
* Linux: `./standalone.sh`
* Windows: `standalone.bat`

Acesse a URL [http://localhost:8080/auth](http://localhost:8080/auth) para criar o usuário administrador.

Crie o usuário administrador com nome `admin` e senha `admin`. Em seguida, acesse a URL [http://localhost:8080/auth/admin/](http://localhost:8080/auth/admin/) e faça o login com as credenciais informadas.

## Configuração

Para iniciar a configuração, é necessário criar um novo *realm* no Keycloak. No painel de configuração, do lado esquerdo, há um menu que estará selecionado como "Master". Através desse menu, clique no botão **Add Realm**.

Na tela de criação, no campo de nome, coloque `alpe` e crie o realm.

### Configuração Automática

Você pode utilizar o arquivo [realm-export.json](./keycloak/realm-export.json) para agilizar o processo de configuração:

* Acesse o realm **alpe** e clique em **Import** na seção **Manage**.
* Na tela de importação, selecione o arquivo [realm-export.json](./keycloak/realm-export.json).
* Deixe todas as opções como **"ON"** e "If a resource exists" como **"Overwrite"**.
* Clique em **Import**.
* Certifique-se que no código está configurado para usar a chave pública do Keycloak.
* Verifique também se não há mocks ou injeções que possam impedir o comportamento normal do Keycloak.

Prossiga na seção ***Crie os Usuários***

### Configuração Manual

Caso não use o arquivo de configuração, para deixar o Keycloak funcional em desenvolvimento, siga o passo a passo:

Crie o cliente `alpe-bko`:
* Na seção **Configure**, acesse **Clients**.
* Na lista de clientes, clique em **Create**.
* Entre com os valores:
  * Client ID: **alpe-bko**.
  * Access Type: **confidential**.
  * Valid Redirect URIs: Por padrão, "**http://localhost:4200/***".
* Clique em **Save**.

Modifique as credenciais:
* Acesse a aba **Credentials**
* Na opção **Client Authenticator** selecione **"Client Id and Secret"**.
* Clique no botão **Regenerate Secret** e anote o valor gerado, pois esse será o seu ***Client Secret***.

Crie as roles do cliente:
* Acesse a aba **Roles**.
* Clique em **Add Role**.
* Entre com o nome da role em **Role Name** e clique **Save**.
* Repita o processo para cada role desejada.

As roles presentes no sistema são:

| Role                          |
| ----------------------------- |
| USUARIO-TI                    |
| BACKOFFICE-ADMINISTRADOR      |
| BACKOFFICE-OPERACOES          |
| ESTABELECIMENTO-ADMINISTRADOR |
| ESTABELECIMENTO-FINANCEIRO    |
| ESTABELECIMENTO-COMPRAS       |
| FORNECEDOR-ADMINISTRADOR      |
| FORNECEDOR-FINANCEIRO         |
| FORNECEDOR-COMERCIAL          |

Altere as configurações na aplicação (auth-settings):
* address: por padrão, **http://localhost:8080**,
* adminUsername: **admin**,
* adminPassword: **admin**,
* clientId: **alpe-bko**,
* clientSecret: o ***Client Secret*** anotado anteriormente.
* clientUUID: para saber o ***Client UUID***, verifique o código na barra do navegador no painel do Keycloak, conforme destacado:
  * .../auth/admin/master/console/#/realms/alpe/clients/**3824e71d-017f-452f-97e8-45227231e6d8**.
  * O valor destacado será o seu ***Client UUID***.
* publicKey: para saber sua chave pública:
  * Na seção **Configure**, acesse **Realm Settings**.
  * Acesse a aba **Keys**.
  * Na linha ***RS256***, clique no botão **Public Key** para visualizar a chave pública.
  * Note que a chave pública deve estar formatada corretamente antes de ser utilizada.
* realm: **alpe**.
* baseUrl: por padrão, **http://localhost:4200**.

* Verifique se não há mocks ou injeções que possam impedir o comportamento normal do Keycloak.

### Crie os Usuários

* Na seção **Configure**, clique em **Users**.
* Clique em **Add User**.
* Entre com os dados do usuário desejado. Por padrão o **Username** é o email de cadastro.
* Clique em **Save**.
* Acesse a aba **Credentials** para alterar a senha do usuário. Deselecione **Temporary**, caso contrário a senha precisará ser redefinida antes do primeiro login.
* Acesse a aba Role Mappings, selecione o **Client Roles** como ***alpe-bko*** e adicione as roles.

#### Importante
O usuário deve estar cadastrado também na tabela de usuário do sistema, bem como participante e membro caso seja um Fornecedor ou Estabelecimento.

Os usuários padrão para teste são: 

| Usuário                | Senha            | Role                          |
| ---------------------- | ---------------- | ----------------------------- |
| admin                  | admin            | USUARIO-TI                    |
| alpe@alpe.com.br       | alpe@alpe.com.br | BACKOFFICE-ADMINISTRADOR      |
| ec@alpe.com.br         | ec@alpe.com.br   | ESTABELECIMENTO-ADMINISTRADOR |
| fornecedor@alpe.com.br | fornecedor@alpe.com.br   | FORNECEDOR-COMERCIAL          |

Feito isso, a configuração estará finalizada.
gustavo.almeida
---
Made with ♥ by ITLAB (http://www.itlab.com.br)

