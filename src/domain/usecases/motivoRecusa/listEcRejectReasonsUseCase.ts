import listService from '../../services/motivoRecusa/listService';
import recusaTipoEnum from '../../entities/recusaTipoEnum';

const listEcRejectReasonsUseCase = db => () => listService(db)(recusaTipoEnum.cad_estabelecimento);

export default listEcRejectReasonsUseCase;
