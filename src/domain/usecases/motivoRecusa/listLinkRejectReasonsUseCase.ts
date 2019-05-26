import listService from '../../services/motivoRecusa/listService';
import recusaTipoEnum from '../../entities/recusaTipoEnum';

const listLinkRejectReasonsUseCase = db => () => listService(db)(recusaTipoEnum.recusa_vinculo);

export default listLinkRejectReasonsUseCase;
