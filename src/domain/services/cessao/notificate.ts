const notificate = (mailer, emailTemplates, mailerSettings, logger) => async (
  aprovado,
  codigoCessao,
  nomeEstabelecimento,
  emailEstabelecimento,
  nomeFornecedor,
  emailFornecedor,
) => {
  let templateEstabelecimento = null;
  let templateFornecedor = null;

  if (aprovado) {
    templateEstabelecimento = emailTemplates.CESSAO_APROVADA_ESTABELECIMENTO;
    templateFornecedor = emailTemplates.CESSAO_APROVADA_FORNECEDOR;
  } else {
    templateEstabelecimento = emailTemplates.CESSAO_REPROVADA_ESTABELECIMENTO;
    templateFornecedor = emailTemplates.CESSAO_REPROVADA_FORNECEDOR;
  }

  try {
    await mailer.enviar({
      templateName: templateEstabelecimento,
      destinatary: emailEstabelecimento,
      substitutions: {
        codigoCessao,
        fornecedor: nomeFornecedor,
        linkCessoesRealizadas: `${mailerSettings.baseUrl}/cessoes`,
      },
    });

    await mailer.enviar({
      templateName: templateFornecedor,
      destinatary: emailFornecedor,
      substitutions: {
        codigoCessao,
        estabelecimento: nomeEstabelecimento,
        linkCessoesRealizadas: `${mailerSettings.baseUrl}/cessoes`,
      },
    });
  } catch (err) {
    logger.error(err);
  }
};

export default notificate;
