var expect = require('chai').expect;
var Formatter = require('../src/index.js');

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
      var formatter = new Formatter(locale);
			localeFormats[locale].forEach(function(pair) {
				expect(formatter.formatDecimal(pair[0])).to.equal(pair[1]);
			});
		});
	});
});

describe('Formatter', function() {
  var locale = 'en_US';
  var formatter = new Formatter(locale);
  it('should allow us to spell en_US numbers', function() {
    expect(formatter.formatAsWords(1000)).to.equal('one thousand');
  });
  it('should allow us to get ordinal numbers', function() {
    expect(formatter.formatAsOrdinal(1000)).to.equal('1,000ᵗʰ');
  });

  it('should allow us to format duration values', function() {
    expect(formatter.format('duration', 60 * 60 + (23 * 60) + 45)).to.equal('1:23:45');
  });
});
