const tiposPessoa = {
  fisica: 1,
  juridica: 2,
  sigla: (tipo: number) => tipo === tiposPessoa.fisica ? 'F' : 'J'
};

export default tiposPessoa;
