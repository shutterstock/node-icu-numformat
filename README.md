# Example

```Javascript
var Formatters = require('../src/index.js');
var numberFormatter = Formatters.NumberFormatter('en_US');
console.log(numberFormatter.format(1234.56)); // 1,234.56

var currencyFormatter = Formatters.NumberFormatter('fr');
console.log(currencyFormatter.format(1234.56, 'EUR')); // 1 234,56 €
```
