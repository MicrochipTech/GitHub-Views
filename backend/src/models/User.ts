import bcrypt from 'bcrypt-nodejs';
import { Document, Schema, model, PopulatedDoc } from 'mongoose';
import { Token } from './Token';

export interface User extends Document {
  _id: Schema.Types.ObjectId,
  username: string,
  password: string,
  msft_oid: string,
  githubEmails: [
    {
      email: string,
      primary: boolean,
      verified: boolean,
      visibility: string,
    },
  ],
  githubId: string,
  token: string,
  token_ref: PopulatedDoc<Token & Document>,
  sharedRepos: Schema.Types.ObjectId[],
}

const userSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
  msft_oid: String,
  githubEmails: [
    {
      email: String,
      primary: Boolean,
      verified: Boolean,
      visibility: String,
    },
  ],
  githubId: String,
  token: String,
  token_ref: { type: Schema.Types.ObjectId, ref: "Token" },
  sharedRepos: [{ type: Schema.Types.ObjectId, ref: "Repository" }],
});

// userSchema.pre("save", function(callback) {
//   const user = this;

//   // Break out if the password hasn't changed
//   if (!user.isModified("password")) return callback();

//   // Password changed so we need to hash it
//   bcrypt.genSalt(5, function(err, salt) {
//     if (err) return callback(err);

//     bcrypt.hash(user.password, salt, null, function(err, hash) {
//       if (err) return callback(err);
//       user.password = hash;
//       callback();
//     });
//   });
// });

// userSchema.methods.verifyPassword = function(password, cb) {
//   bcrypt.compare(password, this.password, function(err, isMatch) {
//     if (err) return cb(err);
//     cb(null, isMatch);
//   });
// };

export default model<User>("User", userSchema);
