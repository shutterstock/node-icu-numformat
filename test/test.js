var expect = require('chai').expect;
var Formatter = require('../lib/index.js');
console.log("# ICU Version: " + Formatter.icuVersion);

var localeFormats = {
	en_US: [
		[1, '1'],
		[1234.56, '1,234.56'],
		[1234.56789, '1,234.568'],
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
    expect(formatter.formatAsOrdinal(1000)).to.match(/^1,000(th|ᵗʰ)$/);
  });

  it('should allow us to format duration values', function() {
    expect(formatter.format('duration', 60 * 60 + (23 * 60) + 45)).to.equal('1:23:45');
  });
  it('should allow us to set attributes', function() {
    var formatter = new Formatter(locale, {max_fraction_digits: 4});
    expect(formatter.formatDecimal(123.1294)).to.equal('123.1294');
    formatter.setAttributes({max_fraction_digits: 2});
    expect(formatter.formatDecimal(123.1294)).to.equal('123.13');
  });

  describe('errors', function() {
    var formatter = new Formatter('en');
    it('should throw exceptions', function() {
      expect(function() { formatter.format('decimal'); }).to.throw(TypeError, /Argument 1 must be a number/);
    });
  });
});
