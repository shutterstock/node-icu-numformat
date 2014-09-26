var expect = require('chai').expect;
var Formatters = require('../src/index.js');

var localeFormats = {
	en_US: [
		[1,     '100%'],
		[0.5,   '50%'],
		[0.001, '0.1%']
	]
};

describe('PercentFormatter', function() {
	it('should format percents as expected', function() {
		Object.keys(localeFormats).forEach(function(locale) {
			var formatter = Formatters.PercentFormatter(locale);
			localeFormats[locale].forEach(function(pair) {
				expect(formatter.format(pair[0])).to.equal(pair[1]);
			});
		});
	});
});
