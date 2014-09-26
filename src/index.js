var NumFormatter = require('../build/Release/numformat.node').NumFormatter;

var styles = {
	decimal: 1,
	currency: 2,
	percent: 3
};

module.exports = {
	NumberFormatter: function(locale) {
		return new NumFormatter(styles.decimal, locale);
	},
	CurrencyFormatter: function(locale) {
		return new NumFormatter(styles.currency, locale);
	},
	PercentFormatter: function(locale) {
		return new NumFormatter(styles.percent, locale);
	}
};
