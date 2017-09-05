# Summary

This module provides bindings to the [libicu](http://site.icu-project.org/) [number formatting](http://userguide.icu-project.org/formatparse/numbers) functions.

## Status

[![Build Status](https://travis-ci.org/shutterstock/node-icu-numformat.svg)](https://travis-ci.org/shutterstock/node-icu-numformat)

## Example

```Javascript
var Formatter = require('icu-numformat');

var en = new Formatter('en_US');
console.log(en.formatDecimal(1234.56)); // 1,234.56

var fr = new Formatter('fr');
console.log(fr.formatCurrency(1234.56, 'EUR')); // 1 234,56 €

var preciseEn = new Formatter('en_US', { max_fraction_digits: 4 });
console.log(preciseEn.formatDecimal(1234.5678)); // 1,234.5678
```

## Installation

### Prerequisites

This module relies on the `icu-config` tool being installed somewhere
in your `PATH`. Installing this vary by system. Here are some examples
to get you started (courtesy of the installation instructions on
https://github.com/mooz/node-icu-charset-detector):

#### Linux

* Debian (Ubuntu)

    ```apt-get install libicu-dev```

* Gentoo

    ```emerge icu```
    
* Fedora/CentOS

    ```yum install libicu-devel```


#### OSX

* MacPorts

    ```port install icu +devel```

* Homebrew

    ```shell
    brew install icu4c
    ln -s /usr/local/Cellar/icu4c/<VERSION>/bin/icu-config /usr/local/bin/icu-config
    ln -s /usr/local/Cellar/icu4c/<VERSION>/include/unicode /usr/local/include
    ```

    If experiencing issues with 'homebrew' installing version 50.1 of icu4c, try the following:

    ```shell
    brew search icu4c
    brew tap homebrew/versions
    brew versions icu4c
    cd $(brew --prefix) && git pull --rebase
    git checkout c25fd2f $(brew --prefix)/Library/Formula/icu4c.rb
    brew install icu4c
    ```

* From source - [Download](http://www.icu-project.org/download/) and follow instructions in the included README

### NPM installation

After installing the prerequisite C library, you may then install the node module with npm:

```
$ npm install icu-numformat
```

## Creating a Formatter Object

The constructor requires a single argument indicating the locale to use when formatting the numbers:

```
var formatter = new Formatter('fr_FR');
```

You may also specify a second argument of options that will affect how numbers are formatted.  For instance:

```
var formatter = new Formatter('da_DK', { max_fraction_digits: 4} );
```

The supported [formatting attributes](http://icu-project.org/apiref/icu4c/unum_8h.html#a22c3085f2e722f578a92c15a3346097f) can be introspected as follows:

```
console.log("Supported Attributes: ", Formatter.attributeNames);
```

## Formatting Values

Once you have a formatter object, you can re-use it to format numbers
appropriately for the locale of that formatter. Each of the following
formatter methods listed below returns a string.

#### Decimals

```
formatter.formatDecimal(123456.789);
```

#### Currencies

```
formatter.formatCurrency(1234.56, 'EUR'); // fr_FR: 1 234,56 €
```

Or, using the ISO currency code (only supported in libicu >=53):

```
formatter.formatCurrency(1234.56, 'EUR', 'ISO'); // fr_FR: 1 234,56 EUR
```

Or finally, using the plural form of the currency name (only supported in libicu >=53):

```
formatter.formatCurrency(1234.56, 'EUR', 'plural'); // fr_FR: 1 234,56 euros
```

#### Percents

```
formatter.formatPercent(0.23); // en_US: 23%
```

#### Words

```
formatter.formatAsWords(1000); // en_US: one thousand
```

#### Ordinals

```
formatter.formatAsOrdinal(21); // en_US: 21st
```

#### Scientific Notation

```
formatter.formatScientific(1234.56); // en_US: 1.23456E3
```

#### Duration

```
formatter.formatAsDuration(300); // en_US: 5:00
```

# Author

This library was written by Brian Phillips at [Shutterstock](http://www.shutterstock.com)

## License

[MIT](LICENSE) © 2014-2017 Shutterstock Images, LLC
