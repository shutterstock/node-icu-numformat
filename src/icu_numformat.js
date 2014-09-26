var NumFormatter = require('../lib/numformat.node').NumFormatter;

var styles = {
	decimal: 1,
	currency: 2,
	percent: 3
};

function Formatter(style, locale) {
	this.numFormatter = new NumFormatter(styles[style], locale);
}

module.exports = {
	NumberFormatter: function(locale) {
		return new Formatter('decimal', locale);
	},
	CurrencyFormatter: function(locale) {
	},
	PercentFormatter: function(locale) {
	}
};
