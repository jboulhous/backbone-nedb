# Backbone-nedb
Backbone.sync to use nedb on the server.


## Usage

Include Backbone.localStorage after having included Backbone.js:

```js
var Store = require('nedb');
var Backbone = require('backbone');
var BackboNeDB = require('backbone-nedb');

var Todo = BackboNeDB.Model.extend({
    defaults: {
        text: "Task to do",
        done: false
    }
});

Todos = BackboNeDB.Collection.extend({
    model: Todo,
    store: new Store({filename: '/path/to/db'})
});
```

Create your collections like so:

```javascript
var Collection = BackboNeDB.Collection.extend({
  store: new Store(nedbOptions), // nedb store
  
  // ... everything else is normal.
  
});
```

## Contributing

1. Fork;
2. Write code, with tests;
3. `npm test`;
4. Create a pull request.

Have fun!

## License

Licensed under MIT license

Copyright (c) 2016 Jamal Boulhous

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.