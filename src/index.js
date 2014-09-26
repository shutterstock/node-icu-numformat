var NumFormatter = require('../build/Release/numformat.node').NumFormatter;

var styles = makeEnum('pattern', 'decimal', 'currency', 'percent', 'scientific', 'spellout', 'ordinal', 'duration');

function makeEnum() {
  var enumData = {};
  for (var i = 0; i < arguments.length; i++) {
    enumData[arguments[i]] = i;
  }
  return enumData;
}

module.exports = {
  Formatter: function(style, locale) {
    return new NumFormatter(styles[style], locale);
  },
	NumberFormatter: function(locale) {
		return new NumFormatter(styles.decimal, locale);
	},
	CurrencyFormatter: function(locale) {
		return new NumFormatter(styles.currency, locale);
	},
	PercentFormatter: function(locale) {
		return new NumFormatter(styles.percent, locale);
	},
  attrs: makeEnum(
    'parse_int_only', 'grouping_used', 'decimal_always_show',
    'max_integer_digits', 'min_integer_digits', 'integer_digits',
    'max_fraction_digits', 'min_fraction_digits', 'fraction_digits', 'multiplier',
    'grouping_size', 'rounding_mode', 'rounding_increment', 'format_width',
    'padding_position', 'secondary_grouping_size significant_digits_used',
    'min_significant_digits', 'max_significant_digits', 'lenient_parse'
  )
};
