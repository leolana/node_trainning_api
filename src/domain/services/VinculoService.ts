import { injectable, inject } from 'inversify';

import findById from './vinculo/findById';
import findByParticipantsIds from './vinculo/findByParticipantsIds';
import { Sequelize } from 'sequelize-database';
import { SiscofWrapper } from '../../infra/siscof';

import types from '../../constants/types';

@injectable()
class VinculoService {
  db: Sequelize;
  siscofWrapper: SiscofWrapper;

  constructor(
    @inject(types.Database) db: Sequelize,
    @inject(types.SiscofWrapper) siscofWrapper: SiscofWrapper
  ) {
    this.db = db;
    this.siscofWrapper = siscofWrapper;
  }

  obterVinculoPorId = (vinculoId, include = []) => findById(this.db, this.siscofWrapper)(vinculoId, include);
  obterVinculoPorIdParticipantes = (estabelecimentoId, fornecedorId, include = []) => {
    return findByParticipantsIds(this.db, this.siscofWrapper)(estabelecimentoId, fornecedorId, include);
  }
}

export default VinculoService;
