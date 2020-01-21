const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt-nodejs");

const encKey = process.env.TOKEN_ENC_KEY;
const sigKey = process.env.TOKEN_SIG_KEY;

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,

  githubId: String,
  token: String,
  sharedRepos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repository" }]
});
userSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ["token"]
});

userSchema.pre("save", function(callback) {
  const user = this;

  // Break out if the password hasn't changed
  if (!user.isModified("password")) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});

userSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
