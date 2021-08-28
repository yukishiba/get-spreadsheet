# Get Spreadsheet

Get Google Spreadsheet datas.

## Use examples
First, install this module in your project.
```console
$ npm install get-spreadsheet
```

```javascript
const fs = require('fs');
const GetSpreadsheet = require('get-spreadsheet');
const privatekey = require('./client_secret.json');

const spreadsheet = new GetSpreadsheet({
  privatekey,
  sheetid: '<YOUR_SPREADSHEET_ID>'
});

(async () => {
  const data = await spreadsheet.get();
  fs.writeFile('sheet.json', JSON.stringify(data), 'utf-8', () => {
    console.log('output: sheet.json');
  });
})();
```

## License
This software is released under the MIT License.
