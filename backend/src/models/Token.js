const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const encKey = process.env.TOKEN_ENC_KEY;
const sigKey = process.env.TOKEN_SIG_KEY;

const tokenSchema = new mongoose.Schema({
  value: String
});
tokenSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ["value"]
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
