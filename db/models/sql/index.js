const QueryFile = require('pg-promise').QueryFile;
const path = require('path');

// Helper for linking to external query files:
function sql(file) {
  const fullPath = path.join(__dirname, file); // generating full path;
  return new QueryFile(fullPath, { minify: true });
}

module.exports = {
  // external queries for Users:
  emojis: {
    get: sql('emoji/get.sql'),
  },
  // external queries for Products:
  iq: {
    get: sql('iq/get.sql'),
  },
};
