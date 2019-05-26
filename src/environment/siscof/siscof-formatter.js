module.exports = (di) => {
  di.provide('$siscof-formatter', () => {
    const siscofBandeira = {
      1: 1, // Master
      2: 2, // Visa
      3: 22, // Elo
      4: 33, // Hipercard
    };

    return Promise.resolve({
      getBandeiraSiscof: (idBandeira) => {
        if ((idBandeira || null) == null) { return null; }
        return siscofBandeira[idBandeira];
      },
      getBandeiraPortal: (idBandeira) => {
        if ((idBandeira || null) == null) { return null; }
        return Object.keys(siscofBandeira).find(key => siscofBandeira[key] == idBandeira);
      },
      get siscofBandeiras() {
        return Object.keys(siscofBandeira).map(k => siscofBandeira[k]);
      },
    });
  });
};
