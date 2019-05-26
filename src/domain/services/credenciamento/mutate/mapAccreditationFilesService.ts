/**
 * Mapeia os arquivos do objeto da model de credenciamentos
 *
 * @param credenciamento Objeto no formato da model de credenciamento com os valores vindos do front já mapeados
 * @param uploadedFiles Arquivos já carregados pelo serviço FileStorage
 * @param unchangedFiles Arquivos que não sofreram alteração caso seja edição de credenciamento
 */
const mapAccreditationFilesService = async (
  credenciamento: any,
  uploadedFiles: any[],
  unchangedFiles: any
) => {

  const domiciliosNovos: { [key: string]: any[] } = {};
  const domiciliosAntigos = [];

  const getDomicilioBancarioKey = (domicilio: any) => {
    return `${domicilio.bancoId}|${domicilio.agencia}|${domicilio.conta}|${domicilio.digito}`;
  };

  credenciamento.domiciliosBancarios.forEach((domicilio: any) => {
    if (domicilio.newFile) {
      const key = getDomicilioBancarioKey(domicilio);
      domiciliosNovos[key] = (domiciliosNovos[key] || []).concat(domicilio);
    } else {
      domiciliosAntigos.push(domicilio);
    }
  });

  const domiciliosNovosOrdenadosPorBandeira = Object.values(domiciliosNovos).sort((domicilio1, domicilio2) => {
    return domicilio1[0].bandeiraId - domicilio2[0].bandeiraId;
  });

  const extratosBancariosFiles = uploadedFiles.filter(file => file.key.indexOf('extratosBancarios') >= 0);

  domiciliosNovosOrdenadosPorBandeira.forEach((domiciliosNovosFromKey, index) => {
    domiciliosNovosFromKey.forEach((domicilio) => {
      if (!extratosBancariosFiles[index]) return;
      domicilio.arquivo = extratosBancariosFiles[index].key;
    });
  });

  credenciamento.domiciliosBancarios = domiciliosAntigos.concat(...domiciliosNovosOrdenadosPorBandeira);

  if (unchangedFiles) {
    if (unchangedFiles.analises) {
      credenciamento.arquivos.analises = unchangedFiles.analises;
    }

    if (Array.isArray(unchangedFiles)) {
      unchangedFiles.forEach((file: any) => {
        if (file.id.startsWith('extrato')) {
          return;
        }

        const alreadySet = file.id in credenciamento.arquivos;
        if (!file.id.startsWith('analise') && !alreadySet) {
          credenciamento.arquivos[file.id] = file.arquivo;
        }
      });
    }
  }
};

export default mapAccreditationFilesService;
