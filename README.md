# Example

```Javascript
var Formatter = require('icu-numformat');
var en = new Formatter('en_US');
console.log(en.formatDecimal(1234.56)); // 1,234.56

var fr = new Formatter('fr');
console.log(fr.formatCurrency(1234.56, 'EUR')); // 1 234,56 €
```
