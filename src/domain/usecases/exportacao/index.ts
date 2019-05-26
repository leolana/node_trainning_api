import exportUseCase from './exportUseCase';
import searchUseCase from './searchUseCase';
import verifyUseCase from './verifyUseCase';

export default (db, siscofWrapper) => ({
  export: exportUseCase(db, siscofWrapper),
  search: searchUseCase(db),
  verify: verifyUseCase(db),
});
