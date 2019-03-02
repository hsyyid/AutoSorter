const {google} = require('googleapis');

exports.helloHttp = (req, res) => {
  ans = "";
  for (var property in req) {
    if (object.hasOwnProperty(property)) {
        ans += property;
        ans += "\n";
    }
  }
  res.send(ans);
  // const {token} = req.body;
  // TODO: Get OAuth2 token
  // res.send(listFiles(token));
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 100,
    fields: 'nextPageToken, files(id, name, mimeType)',
  }, (err, res) => {
    if (err) res.send('The API returned an error: ' + err);
    let ans = "";
    const files = res.data.files;
    if (files.length) {
      ans += "Files:\n";
      files.map((file) => {
        ans += `${file.name} (${file.id}) - ${file.mimeType}\n`
      });
    } else {
      ans += "No files found.";
    }
    return ans;
  });
}
