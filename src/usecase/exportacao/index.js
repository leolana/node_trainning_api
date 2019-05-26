const exportFile = require('./export.usecase');
const search = require('./search.usecase');
const verify = require('./verify.usecase');

module.exports = (db, siscofWrapper) => ({
  export: exportFile(db, siscofWrapper),
  search: search(db),
  verify: verify(db),
});
