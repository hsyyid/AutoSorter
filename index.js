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
  let list = [];
  let pageToken = undefined;
  let complete = false;

  // Gets full list of all doc files
  await async.whilst(
    () => !complete,
    async callback => {
      // Get page of 100 files
      await new Promise(done => {
        drive.files.list(
          {
            pageSize: 100,
            pageToken,
            fields: "nextPageToken, files(id, name, mimeType)"
          },
          (err, res) => {
            if (err) console.error(err);
            const { files, nextPageToken } = res.data;

            // Only want text documents in overall list
            list.push(
              files.filter(
                file => file.mimeType === "application/vnd.google-apps.document"
              )
            );

            // If not complete, continue
            if (nextPageToken) pageToken = nextPageToken;
            else complete = false;

            // Finished this iteration
            done();
          }
        );
      });
    }
  );

  if (list) {
    let { labels } = await analyzeFiles(access_token, list, n_subjects);

    // NOTE: UNTESTED
    // Write Changes to Google Drive
    await writeChanges(drive, n_subjects, list, labels);

    return { labels, files };
  }
}

async function writeChanges(drive, n_subjects, files, labels) {
  let folderIds = [];

  // Create folders for each proposed 'subject'
  for (let i = 0; i < n_subjects; i++) {
    const folderMetadata = {
      name: i,
      mimeType: "application/vnd.google-apps.folder"
    };

    drive.files.create(
      {
        resource: folderMetadata,
        fields: "id"
      },
      function(err, file) {
        if (err) {
          console.error(error);
        } else {
          console.log(`Creating folder with id ${file.id}`);
          folderIds.push(file.id);
        }
      }
    );
  }

  // Place files in folders
  for (let i = 0; i < labels.length; i++) {
    // Get label for this document
    const label = labels[i];
    // Get file object
    const file = files[i];
    // Create copy of this document
    // TODO: Probably doesn't just return a 'copy'
    const copy = drive.files.copy(file.id);
    // Put copy in corresponding folder
    // TODO: Does this accomplish that?
    copy.parents = [folderIds[label]];
  }
}
