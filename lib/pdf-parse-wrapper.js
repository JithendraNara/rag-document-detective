// Custom pdf-parse wrapper to avoid test file loading issues on Vercel
const Pdf = require('pdf-parse/lib/pdf-parse');

module.exports = function(dataBuffer, options) {
    return Pdf(dataBuffer, options);
};
