var expect = require('chai').expect;
var Formatter = require('../src/index.js');

var localeFormats = {
	en_US: [
		[1,     '100%'],
		[0.5,   '50%'],
		// [0.001, '0.1%'] // FIXME: we don't have support for setting attributes on the formatter yet
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
