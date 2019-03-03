const { google } = require("googleapis");
const fetch = require("node-fetch");

exports.request = async (req, rtn) => {
  // const { auth_token, n_subjects } = req.body;
  let auth_token =
    "ya29.GlvBBg-EPsAzn9NNkM2w1MCFpsyR7m19bhPZd748hBGQFUuqnO0Vh9jW6kU6_5At-2_UPA0LYtQE8n5IL8uuznBYfwDiaWxiqrUGIXT-lOWQSAeR8Y7FLVWVaZ0Q";
  let refresh_token = "1/905F0z4FqwSnvuy2rzmjYst9bsQqz795rANMCciajSM";

  let n_subjects = 7;
  let files = await listFiles(auth_token);

  // fetch("https://us-central1-hoohacks-cc16b.cloudfunctions.net/ml", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     message: files.map(f => f.text),
  //     subjects: n_subjects
  //   })
  // })
  //   .then(res => res.json())
  //   .then(res => {
  //     rtn.send({ files: files.map(f => f.name), labels: res });
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });
};

async function convertToText(access_token, files) {
  files = files.filter(
    file => file.mimeType === "application/vnd.google-apps.document"
  );

  let response = await fetch(
    "https://us-central1-hoohacks-cc16b.cloudfunctions.net/ml?text=true",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file_ids: files.map(f => f.id),
        access_token
      })
    }
  );

  let json = await response.json();
  console.error(json);
  return json;
}

async function listFiles(access_token, refresh_token) {
  const oauth2Client = new google.auth.OAuth2(
    "219711634489-fbdu21o00er8rm2sjomr29eannn3tmdo.apps.googleusercontent.com",
    "pURYu1O2cbbVPKu5BH-lkbLU"
  );
  oauth2Client.setCredentials({
    access_token,
    refresh_token
  });

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  let files = await new Promise(resolve => {
    drive.files.list(
      {
        pageSize: 25,
        fields: "nextPageToken, files(id, name, mimeType)"
      },
      (err, res) => {
        if (err) console.error(err);
        const { files } = res.data;
        resolve(files);
      }
    );
  });

  if (files) {
    let converted = await convertToText(access_token, files);
    console.error(converted);
    return converted;
  }
}
