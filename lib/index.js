var lib = require('bindings')('numformat');
var NumFormatter = lib.NumFormatter;

function makeEnum() {
	var enumData = {};
	for (var i = 0; i < arguments.length; i++) {
		enumData[arguments[i]] = i;
	}
	return enumData;
}

var STYLES = makeEnum('pattern', 'decimal', 'currency', 'percent', 'scientific', 'spellout', 'ordinal', 'duration');
var ATTRS = makeEnum(
	'parse_int_only', 'grouping_used', 'decimal_always_show',
	'max_integer_digits', 'min_integer_digits', 'integer_digits',
	'max_fraction_digits', 'min_fraction_digits', 'fraction_digits', 'multiplier',
	'grouping_size', 'rounding_mode', 'rounding_increment', 'format_width',
	'padding_position', 'secondary_grouping_size significant_digits_used',
	'min_significant_digits', 'max_significant_digits', 'lenient_parse'
);

function convertAttrs(attrs) {
	var converted = {};
	Object.keys(attrs).forEach(function(k) {
		converted[ATTRS[k]] = attrs[k];
	});
	return converted;
}

function factory(obj, type) {
	if(!STYLES[type]) throw new Error("Invalid format type " + type);

	var formatters = obj._formatters;
	if(!formatters[type]) {
		if(obj._attrs) {
			var converted = convertAttrs(obj._attrs);
			formatters[type] = new NumFormatter(STYLES[type], obj.locale, converted);
		} else {
			formatters[type] = new NumFormatter(STYLES[type], obj.locale);
		}
	}
	return formatters[type];
}

function Formatter(locale, attrs) {
	this.locale = locale;
	this._formatters = {};
	if(attrs) this._attrs = attrs;
	return this;
};

Formatter.icuVersion = lib.VERSION;

Formatter.prototype.formatCurrency = function(number, currency) {
	return factory(this, 'currency').format(number, currency);
};

Formatter.prototype.format = function(type, number) {
	return factory(this, type).format(number);
};

Formatter.prototype.setAttributes = function(type, attrs) {
	if(typeof type === 'object' && !attrs) {
		attrs = type;
		type = undefined; // this implies setting the attributes on all formatters
	} else if(!attrs) {
		throw new TypeError("No attributes specified");
	}

	if(!this._attrs) this._attrs = {};

	var existing = this._attrs;
	var converted = convertAttrs(attrs);
	var formatters = this._formatters || {};
	if(type) {
		// set the attribute only on a specific formatter
		factory(this, type).setAttributes(converted);
	} else {
		Object.keys(formatters).forEach(function(type) {
			var f = formatters[type];
			f.setAttributes(converted);
		});

		Object.keys(attrs).forEach(function(k) {
			existing[k] = attrs[k];
		});
	}

	this._attrs;
};

var formatters = {
	formatDecimal: 'decimal',
	formatPercent: 'percent',
	formatAsWords: 'spellout',
	formatAsOrdinal: 'ordinal',
};
Object.keys(formatters).forEach(function(k) {
	Formatter.prototype[k] = function(number) {
		return factory(this, formatters[k]).format(number);
	};
});

module.exports = Formatter;
