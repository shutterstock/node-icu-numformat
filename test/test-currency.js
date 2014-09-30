var expect = require('chai').expect;
var Formatter = require('../lib/index.js');

var localeFormats = {
	en_US: [
		[1,       'USD', '$1.00'],
		[1234.56, 'USD', '$1,234.56']
	],
  en_IN: [
    [123456.78, 'USD', '$\xA01,23,456.78'],
    [123456.78, 'USD', '$\xA01,23,456.78'],
  ],
  fr: [
    [1234.56, 'EUR', '1\xA0234,56\xA0€'],
  ],
  jp: [
    [123456.78, 'USD', '$123,456.78'],
    [123456.78, 'JPY', '¥123,457'],
  ]
};

describe('CurrencyFormatter', function() {
  Object.keys(localeFormats).forEach(function(locale) {
    var formatter = new Formatter(locale);
    it('should format ' + locale + ' currency amounts as expected', function() {
			localeFormats[locale].forEach(function(pair) {
				expect(formatter.formatCurrency(pair[0], pair[1])).to.equal(pair[2]);
			});
		});
	});
});
