var expect = require('chai').expect;
var Formatter = require('../lib/index.js');
console.log("# ICU Version: " + Formatter.icuVersion);

var localeFormats = {
	en_US: [
		[1,    '100%'],
		[0.5,  '50%'],
		[0.01, '1%']
	]
};

describe('PercentFormatter', function() {
	Object.keys(localeFormats).forEach(function(locale) {
		var formatter = new Formatter(locale);
		it('should format ' + locale + ' percents as expected', function() {
			localeFormats[locale].forEach(function(pair) {
				expect(formatter.formatPercent(pair[0])).to.equal(pair[1]);
			});
		});
	});
});
