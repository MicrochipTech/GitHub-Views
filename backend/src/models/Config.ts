import mongoose, {Schema, Document} from "mongoose"

export interface IConfig extends Document {
  forRepos: string,
  repoMetadata: string[]
}

const ConfigSchema: Schema = new Schema({
  forRepos: { type: String },
  repoMetadata: { type: [String] }
})

export default mongoose.model<IConfig>('Config', ConfigSchema)
