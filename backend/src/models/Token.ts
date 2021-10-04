
import encrypt from 'mongoose-encryption';
import { Document, Schema, model } from 'mongoose';

const encKey = process.env.TOKEN_ENC_KEY;
const sigKey = process.env.TOKEN_SIG_KEY;

export interface Token extends Document {
  value: string
}

const tokenSchema = new Schema({
  value: String
});
tokenSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ["value"]
});


export default model<Token>("Token", tokenSchema);
