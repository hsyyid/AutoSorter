const { google } = require("googleapis");
const fetch = require("node-fetch");

exports.request = async (req, rtn) => {
  const { auth_token, refresh_token, n_subjects } = req.body;

  let response = await fetchAndAnalyze(
    auth_token,
    refresh_token,
    parseInt(n_subjects)
  );

  console.error(response);
  rtn.send(response);
};

async function analyzeFiles(access_token, files, subjects) {
  let response = await (await fetch(
    "***REMOVED***/ml",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file_ids: files.map(f => f.id),
        access_token,
        subjects
      })
    }
  )).json();

  return response;
}

async function fetchAndAnalyze(access_token, refresh_token, n_subjects) {
  const oauth2Client = new google.auth.OAuth2(
    "***REMOVED***",
    "***REMOVED***"
  );
  oauth2Client.setCredentials({
    access_token,
    refresh_token
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  let files = await new Promise(resolve => {
    drive.files.list(
      {
        pageSize: 100,
        fields: "nextPageToken, files(id, name, mimeType)"
      },
      (err, res) => {
        if (err) console.error(err);
        const { files } = res.data;
        resolve(
          files.filter(
            file => file.mimeType === "application/vnd.google-apps.document"
          )
        );
      }
    );
  });

  if (files) {
    let { labels } = await analyzeFiles(access_token, files, n_subjects);

    let folderIds = [];

    // BEGIN DANGEROUS WRITING CODE

    // for (let i = 0; i < n_subjects; i++) {
    //   const folderMetadata = {
    //     name: i,
    //     mimeType: "application/vnd.google-apps.folder"
    //   };
    //   drive.files.create(
    //     {
    //       resource: folderMetadata,
    //       fields: "id"
    //     },
    //     function(err, file) {
    //       if (err) {
    //         console.error(error);
    //       } else {
    //         console.log(`Creating folder with id ${file.id}`);
    //         folderIds.push(file.id);
    //       }
    //     }
    //   );
    // }
    //
    // for (let i = 0; i < labels.length; i++) {
    //   const label = labels[i];
    //   const file = files[i];
    //   const copy = drive.files.copy(file.id);
    //   copy.parents = [folderIds[label]];
    // }

    // END DANGEROUS WRITING CODE

    return { labels, files };
  }
}
