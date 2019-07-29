const fetch = require("node-fetch");
const uuidv4 = require("uuid/v4");
const Bluebird = require("bluebird");

const { API_URL } = process.env;

const create = async (access_token, folderIds) => {
  await Bluebird.each(folderIds, async fileId => {
    await (await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/watch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + access_token
        },
        body: JSON.stringify({
          id: uuidv4(),
          type: "web_hook",
          address: `${API_URL}/api/notifications`
        })
      }
    )).json();
  });
};

// TODO: Save update via storage.js to Cloud Storage Bucket (update CSVs?)
const receive = async headers => {
  if (headers["X-Goog-Resource-State"] === "update") {
    // TODO: Since we are listening to whole folder maybe just one of these is relevant
    // ie. children will change, right?
    if (
      headers["X-Goog-Changed"] == "parents" ||
      headers["X-Goog-Changed"] == "children"
    ) {
      console.error(headers);
    } // RENAMED FOLDER... TODO: get name and save it alongside relevant document vectors
    else if (headers["X-Goog-Changed"] == "properties") {
      console.error(headers);
    }
  }
};

module.exports = {
  create,
  receive
};
