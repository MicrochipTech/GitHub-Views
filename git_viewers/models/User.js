const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const encKey = process.env.TOKEN_ENC_KEY;
const sigKey = process.env.TOKEN_SIG_KEY;

const userSchema = new mongoose.Schema({
  username: String,
  githubId: String,
  token: String,
  sharedRepos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repository" }]
});
userSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ["token"]
});

const User = mongoose.model("User", userSchema);

module.exports = User;
