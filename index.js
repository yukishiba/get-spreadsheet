const {google} = require('googleapis');

class GetSpreadSheet {
  constructor(options) {
    this.sheetid = 'sheetid' in options ? options.sheetid : '';
    this.privatekey = 'privatekey' in options ? options.privatekey : {};
    this.rowlabel = 'rowlabel' in options ? options.rowlabel : 0;
    this.datastart = 'datastart' in options ? options.datastart : 1;
    this.console = 'console' in options ? options.console : false;
    this.split = 'split' in options ? options.split : '';
  }

  consoleLog (text) {
    if (this.console) console.log(text)
  }

  cleanData (response, i) {
    const keys = response.data.values[this.rowlabel];
    const row = response.data.values[i];
    const dist = {};
    for (let j = 0; j < keys.length; j++) {
      if (keys[j]) {
        dist[keys[j]] = row[j];
      }
    }
    return dist
  }

  parseAssociativeArray (response) {
    const data = {};
    for (let i = this.datastart; i < response.data.values.length; i++) {
      const row = this.cleanData(response, i);
      data[row.key] = ('value' in row) ? row.value : row;
    }
    return data;
  }

  parseArray (response) {
    const data = [];
    for (let i = this.datastart; i < response.data.values.length; i++) {
      const row = this.cleanData(response, i);
      data.push(row);
    }
    return data;
  }

  async readSheet (token) {
    const sheets = google.sheets('v4');

    const allSheets = await sheets.spreadsheets.get({
      auth: token,
      spreadsheetId: this.sheetid,
    });

    const distData = {};

    for (const sheet of allSheets.data.sheets) {
      const sheetName = sheet.properties.title || null;

      if (!sheetName) continue;
      if (this.split && sheetName.indexOf(this.split) === -1) continue;

      const request = {
        auth: token,
        spreadsheetId: this.sheetid,
        range: sheetName,
      };

      try {
        const response = await sheets.spreadsheets.values.get(request);
        const sheetKey = this.split ? sheetName.split(this.split)[0] : sheetName;
        const labels = response.data.values[this.rowlabel]

        if (~labels.indexOf('key')) {
          distData[sheetKey] = this.parseAssociativeArray(response);
        } else {
          distData[sheetKey] = this.parseArray(response);
        }
        this.consoleLog('getSpreadSheet: ' + request.range);
      } catch (err) {
        console.error('error at GetSpreadSheet: ' + err);
      }
    }

    return distData;
  };

  authorize () {
    return new Promise((resolve, reject) => {
      const jwtClient = new google.auth.JWT(
        this.privatekey.client_email,
        null,
        this.privatekey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets'],
      );

      jwtClient.authorize(
        () => {
          this.consoleLog('Successfully connected!');
          resolve(jwtClient);
        },
        (error) => {
          reject(error);
        });
    });
  };

  async get () {
    try {
      const token = await this.authorize();
      return this.readSheet(token);
    } catch (error) {
      console.error('error at GetSpreadSheet: ', error);
      return null;
    }
  }
};

module.exports = GetSpreadSheet;