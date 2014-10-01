var expect = require('chai').expect;
var Formatter = require('../lib/index.js');
console.log("# ICU Version: " + Formatter.icuVersion);

describe('Formatter', function() {
	var locale = 'en_US';
	var formatter = new Formatter(locale);

  describe('formatter methods', function() {
    it('should allow us to format decimal values', function() {
      expect(formatter.formatDecimal(1234.56)).to.equal('1,234.56');
    });

    it('should format currency values', function() {
      expect(formatter.formatCurrency(1234.56, 'USD')).to.equal('$1,234.56');
    });

    describe('version >= 53 features', function() {
      if(Formatter.icuVersion >= 53) {
        it('should allow for formatting with the ISO currency code', function() {
          expect(formatter.formatCurrency(1234.56, 'USD', 'ISO')).to.be.equal('USD1,234.56');
        });

        it('should format currency values with the plural form', function() {
          expect(formatter.formatCurrency(1234.56, 'USD', 'plural')).to.equal('1,234.56 US Dollars');
        });
      } else {
        it('should throw an exception when using these features without the right lib version', function() {
          expect(function() { formatter.formatCurrency(1234.56, 'USD', 'ISO'); }).to.throw(Error);
        });
      }
    });

    it('should allow us to format percent values', function() {
      expect(formatter.formatPercent(0.24)).to.equal('24%');
      expect(formatter.formatPercent(0.01)).to.equal('1%');
    });

    it('should allow us to spell en_US numbers', function() {
      expect(formatter.formatAsWords(1000)).to.equal('one thousand');
    });

    it('should allow us to get ordinal numbers', function() {
      // not sure why but sometimes this comes out as ascii and sometimes utf-8
      expect(formatter.formatAsOrdinal(1000)).to.match(/^1,000(th|ᵗʰ)$/);
    });

    it('should allow us to format duration values', function() {
      expect(formatter.formatAsDuration(60 * 60 + (23 * 60) + 45)).to.equal('1:23:45');
    });

    it('should allow us to format values using scientific notation', function() {
      expect(formatter.formatScientific(1234.56)).to.equal('1.23456E3');
    });
  });

	describe('attributes', function() {
		it('should allow us to set attributes', function() {
			var formatter = new Formatter(locale, {max_fraction_digits: 4});
			expect(formatter.formatDecimal(123.1294)).to.equal('123.1294');

			formatter.setAttributes({max_fraction_digits: 2});
			expect(formatter.formatDecimal(123.1294)).to.equal('123.13');
		});

		it('should allow for setting attributes only on a specific type of formatter', function() {
			var formatter = new Formatter(locale, {max_fraction_digits: 3});
			expect(formatter.formatDecimal(123.1295)).to.equal('123.13');
			expect(formatter.formatPercent(0.00001)).to.equal('0.001%');

			formatter.setAttributes('percent', {max_fraction_digits: 2});
			expect(formatter.formatPercent(0.00001)).to.equal('0%');
		});
	});

	describe('errors', function() {
		var formatter = new Formatter('en');
		it('should throw exceptions', function() {
			expect(function() { formatter.formatDecimal(); }).to.throw(TypeError, /Argument 1 must be a number/);
		});
	});
});
