var lib = require('bindings')('numformat');
var NumFormatter = lib.NumFormatter;

function makeEnum() {
	var enumData = {};
	var i;
	for (i = 0; i < arguments.length; i++) {
		enumData[arguments[i]] = i;
	}
	return enumData;
}

var STYLES = makeEnum(
	'pattern', 'decimal', '_currency', 'percent',
	'scientific', 'spellout', 'ordinal', 'duration',
	'_numbering_system', '_pattern_rulebased', '_currency_iso',
	'_currency_plural'
);

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
	if(!type || !STYLES[type.toLowerCase()]) {
		throw new Error("Invalid format type " + type);
	}
	type = type.toLowerCase();

	var typeEnum = STYLES[type];
	var formatters = obj._formatters;
	try {
		if(!formatters[type]) {
			if(obj._attrs) {
				var converted = convertAttrs(obj._attrs);
				formatters[type] = new NumFormatter(typeEnum, obj.locale, converted);
			} else {
				formatters[type] = new NumFormatter(typeEnum, obj.locale);
			}
		}
	} catch(e) {
		throw new Error("Unable to create a " + type + " formatter: " + e);
	}
	return formatters[type];
}

function Formatter(locale, attrs) {
	this.locale = locale;
	this._formatters = {};
	if(attrs) {
		this._attrs = attrs;
	}
	return this;
}

Formatter.icuVersion = lib.VERSION;
Formatter.attributeNames = Object.keys(ATTRS);

Formatter.prototype.formatCurrency = function(number, currency, style) {
	if(!style) {
		style = '_currency';
	} else {
		if(lib.VERSION >= 53) {
			style = '_currency_' + style;
		} else {
			throw new Error("Your version of ICU (" + lib.VERSION + ") doesn't support " + style + " currency formatting (upgrade to version >= 53)");
		}
	}
	return factory(this, style).format(number, currency);
};

var formatters = {
	formatDecimal: 'decimal',
	formatPercent: 'percent',
	formatAsWords: 'spellout',
	formatAsOrdinal: 'ordinal',
	formatScientific: 'scientific',
	formatAsDuration: 'duration'
};
Object.keys(formatters).forEach(function(k) {
	Formatter.prototype[k] = function(number) {
		return factory(this, formatters[k]).format(number);
	};
});

Formatter.prototype.setAttributes = function(type, attrs) {
	if(typeof type === 'object' && !attrs) {
		attrs = type;
		type = undefined; // this implies setting the attributes on all formatters
	} else if(!attrs) {
		throw new TypeError("No attributes specified");
	}

	if(!this._attrs) {
		this._attrs = {};
	}

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

	return this._attrs;
};

module.exports = Formatter;
