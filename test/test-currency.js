var expect = require('chai').expect;
var Formatters = require('../src/index.js');

var localeFormats = {
	en_US: [
		[1,       'USD', '$1.00'],
		[1234.56, 'USD', '$1,234.56']
	],
  en_IN: [
    [123456.78, 'USD', '$\xA01,23,456.78'],
    [123456.78, 'USD', '$\xA01,23,456.78'],
  ],
  jp: [
    [123456.78, 'USD', '$123,456.78'],
    [123456.78, 'JPY', '¥123,457'],
  ]
};

describe('CurrencyFormatter', function() {
  Object.keys(localeFormats).forEach(function(locale) {
    it('should format ' + locale + ' currency amounts as expected', function() {
			var formatter = Formatters.CurrencyFormatter(locale);
			localeFormats[locale].forEach(function(pair) {
				expect(formatter.format(pair[0], pair[1])).to.equal(pair[2]);
			});
		});
	});
});
