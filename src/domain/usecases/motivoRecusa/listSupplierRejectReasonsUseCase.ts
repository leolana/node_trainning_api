import listService from '../../services/motivoRecusa/listService';
import recusaTipoEnum from '../../entities/recusaTipoEnum';

const listSupplierRejectReasonsUseCase = db => () => listService(db)(recusaTipoEnum.cad_fornecedor);

export default listSupplierRejectReasonsUseCase;
