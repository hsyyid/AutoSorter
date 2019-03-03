const { google } = require("googleapis");
const fetch = require("node-fetch");

exports.request = (req, res) => {
  const { auth_token, n_subjects } = req.body;
  let files = listFiles(auth_token);

  fetch("***REMOVED***/ml", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: files, subjects: n_subjects })
  })
    .then(res => res.json())
    .then(res => {
      res.send({ files, labels: res });
    })
    .catch(err => {
      console.error(err);
    });
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
