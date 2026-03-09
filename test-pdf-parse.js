const { PDFParse } = require('pdf-parse');

console.log('PDFParse type:', typeof PDFParse);
console.log('PDFParse.prototype methods:', Object.getOwnPropertyNames(PDFParse.prototype));

// Try with options
try {
  const parser = new PDFParse({ verbosity: 0 });
  console.log('Created with verbosity 0:', typeof parser);
  console.log('Parser methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
} catch (e) {
  console.log('Error:', e.message);
}
