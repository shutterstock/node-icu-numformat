var expect = require('chai').expect;
var Formatters = require('../src/index.js');

var localeFormats = {
	en_US: [
		[1, '1'],
		[1234.56, '1,234.56']
	],
	fr_FR: [
		[1, '1'],
		[1234.56, '1\xA0234,56']
	],
	de_CH: [
		[1, '1'],
		[1234.56, '1\'234.56'],
	],
	hi_IN: [
		[1, '१'],
		[1000000, '१०,००,०००']
	]
};
describe('NumberFormatter', function(){
	it('should format per locale', function(){
		Object.keys(localeFormats).forEach(function(locale) {
			var formatter = Formatters.NumberFormatter(locale);
			localeFormats[locale].forEach(function(pair) {
				expect(formatter.format(pair[0])).to.equal(pair[1]);
			});
		});
	});
});

