var expect = require('chai').expect
var m      = require('../src/icu_numformat');

describe('NumberFormatter', function() {
	describe('#format', function() {
		it('should format numbers as expected', function() {
			var cases = {
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
				]
			};

			Object.keys(cases).forEach(function(locale) {
				var formatter = m.NumberFormatter(locale);
				cases[locale].forEach(function(pair) {
					expect(formatter.format(pair[0])).to.equal(pair[1]);
				});
			});
		});
	});
});
