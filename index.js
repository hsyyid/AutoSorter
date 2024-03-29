const { google } = require("googleapis");
const fetch = require("node-fetch");
const watch = require("./watch.js");
const storage = require("./storage.js");
const whilst = require("async/whilst");

const { API_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = process.env;

exports.request = async (req, rtn) => {
  // TODO: Testing
  if (req.path === "/notifications") {
    // TODO: Assuming correct var is req.headers
    await watch.receive(req.headers);
  } else if (req.path === "/rename") {
    const { auth_token, refresh_token, fileId, name } = req.body;
    await renameFolder(auth_token, refresh_token, fileId, name);
  } else {
    const { uid, auth_token, refresh_token, n_subjects } = req.body;

    let response = await fetchAndAnalyze(
      uid,
      auth_token,
      refresh_token,
      parseInt(n_subjects)
    );

    console.error(response);
    rtn.send(response);
  }
};

async function analyzeFiles(access_token, files, subjects) {
  // TODO: Batch request only takes 100 requests, and we are limited to 10
  // requests per second per user, we will need to split this into a maximum of
  // 10 requests (1,000 files). Else we will need to wait for a second or two
  // before requesting more to avoid rate limiting.
  // TODO: Do batch requests completely fix problem with rate limiting?
  let response = await (await fetch(
    `${API_URL}/ml`,
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

async function fetchAndAnalyze(uid, access_token, refresh_token, n_subjects) {
  const oauth2Client = new google.auth.OAuth2(
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    access_token,
    refresh_token
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });
  let list = [];
  let pageToken = undefined;
  let complete = false;

  // Get page of 100 files
  await new Promise(done => {
    drive.files.list(
      {
        pageSize: 50,
        fields: "nextPageToken, files(id, name, mimeType)"
      },
      (err, res) => {
        if (err) console.error(err);
        else console.error(res);

        let { files, nextPageToken } = res.data;

        // Only want text documents in overall list
        files = files.filter(
          file => file.mimeType === "application/vnd.google-apps.document"
        );

        Array.prototype.push.apply(list, files);
        console.log(`== Added ${files.length} files to list ==`);

        done();
      }
    );
  });

  if (list) {
    console.log(`== ${list.length} Files Found ==`);
    let { labels, data } = await analyzeFiles(access_token, list, n_subjects);

    // Write Changes to Google Drive
    await writeChanges(drive, access_token, n_subjects, list, labels);

    // NOTE: UNTESTED
    // Mirror current state in Cloud Storage
    await storage.SaveDocuments(uid, data, labels);

    return { labels, files: list };
  }
}

async function renameFolder(access_token, refresh_token, fileId, name) {
  const oauth2Client = new google.auth.OAuth2(
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    access_token,
    refresh_token
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  drive.files.update(
    {
      fileId: fileId,
      name: name
    },
    function(err, file) {
      console.error(file);
    }
  );
}

async function writeChanges(drive, access_token, n_subjects, files, labels) {
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
      function(err, res) {
        if (err) {
          console.error(err);
        } else {
          console.error(res.data);
          folderIds.push(res.data.id);
        }
      }
    );
  }

  // Creates notification channel for folders
  await watch.create(folderIds, access_token);

  // Place files in folders
  fetch(`${API_URL}?copy=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      file_ids: files.map(f => f.id),
      access_token,
      folder_ids: folderIds,
      labels
    })
  });
}
