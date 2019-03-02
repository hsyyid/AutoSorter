const { google } = require("googleapis");

exports.request = (req, res) => {
  const { auth_token } = req.body;
  let files = listFiles(auth_token);
  res.send(files);
};

function listFiles(auth) {
  const drive = google.drive({ version: "v3", auth });

  drive.files.list(
    {
      pageSize: 1000,
      fields: "nextPageToken, files(id, name, mimeType)"
    },
    (err, res) => {
      if (err) res.send("The API returned an error: " + err);
      const { files } = res.data;

      if (files) {
        return files.map(file => {
          drive.files
            .export({
              fileId: file.id,
              mimeType: file.mimeType
            })
            .then(res => {
              return {
                name: file.name,
                text: res
              };
            });
        });
      }
    }
  );
}
