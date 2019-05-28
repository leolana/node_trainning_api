import { injectable } from 'inversify';

@injectable()
class SiscofFormatter {
  private siscofBandeira = {
    1: 1, // Master
    2: 2, // Visa
    3: 22, // Elo
    4: 33, // Hipercard
  };

  getBandeiraSiscof = (idBandeira) => {
    if ((idBandeira || null) == null) { return null; }
    return this.siscofBandeira[idBandeira];
  }
  getBandeiraPortal = (idBandeira) => {
    if ((idBandeira || null) == null) { return null; }
    return Object.keys(this.siscofBandeira).find(key => this.siscofBandeira[key] == idBandeira);
  }

  get siscofBandeiras() {
    return Object.keys(this.siscofBandeira).map(k => this.siscofBandeira[k]);
  }
}

export default SiscofFormatter;
