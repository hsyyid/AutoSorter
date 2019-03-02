const {google} = require('googleapis');

exports.helloHttp = (req, res) => {
  ans = "";
  for (var property in req.body) {
    if (req.body.hasOwnProperty(property)) {
        ans += property;
        ans += "\n";
    }
  }
  // res.send(ans);
  // const {token} = req.body;
  // TODO: Get OAuth2 token
  res.send(JSON.stringify(listFiles(req.body)));
}

/**
 * Lists the names and IDs of up to 100 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 100,
    fields: 'nextPageToken, files(id, name, mimeType)',
  }, (err, res) => {
    if (err) res.send('The API returned an error: ' + err);
    let ans = {};
    const files = res.data.files;
    if (files.length) {
      ans.length = files.length;
      ans.titles = [];
      ans.ids = [];
      ans.mimeType = [];
      ans.content = [];
      files.map((file) => {
        ans.titles.push(file.name);
        ans.ids.push(file.id);
        ans.mimeType.push(file.mimeType);
        // I'll finish it eventually
        /* const content = files.export({
          fileId: file.id,
        }) */
      });
    }
    return ans;
  });
}
