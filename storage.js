const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
  projectId: "hoohacks-cc16b"
});
const bucket = storage.bucket("hoohacks-autosort-training-data");

// documentation: https://cloud.google.com/nodejs/docs/reference/storage/2.3.x/File#save
const SaveDocuments = async (uid, data, labels) => {
  const file = bucket.file(uid + "/data.csv");
  const contents = data;

  // No response, throws error if fails.
  await file.save(contents);
};

module.exports = {
  SaveDocuments
};
