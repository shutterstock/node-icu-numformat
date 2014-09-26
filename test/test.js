var expect = require('chai').expect
var m      = require('../src/icu_numformat');

var cases = {
	en_US: [
		[1234.56, '1,234.56']
	],
	fr_FR: [
		[1234.56, '1\xA0234,56']
	]
};

Object.keys(cases).forEach(function(locale) {
	var formatter = m.NumberFormatter(locale);
	cases[locale].forEach(function(pair) {
		expect(formatter.format(pair[0])).to.equal(pair[1]);
	});
});
