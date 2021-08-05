import mongoose, {Schema, Document} from "mongoose"

// TODO
type User = any; 
type Views = any;
type Clones = any; 
type Referrer = any;
type Content = any;
type NameHistory = any;
type Commits = any;

export interface IRepository extends Document {
  not_found: boolean; 
  users: string[] | User[];
  github_repo_id: string;
  reponame: string;
  metadata: Object;
  views: Views; 
  clones: Clones; 
  referrers: Referrer[],
  contents: Content[],
  nameHistory: NameHistory[],
  commits: Commits,
}

const forkSchema: Schema = new mongoose.Schema();
forkSchema.add({
  github_repo_id: String,
  reponame: String,
  count: Number,
  children: [forkSchema],
});

const repositorySchema: Schema = new mongoose.Schema({
  not_found: Boolean,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  github_repo_id: String,
  reponame: {
    type:String,
    unique: true, // this is important!! (it creates an index in the db)
  },
  metadata: {
    type: Object,
  },
  views: {
    total_count: Number,
    total_uniques: Number,
    data: [
      {
        timestamp: Date,
        count: Number,
        uniques: Number,
      },
    ],
  },
  clones: {
    total_count: Number,
    total_uniques: Number,
    data: [
      {
        timestamp: Date,
        count: Number,
        uniques: Number,
      },
    ],
  },
  forks: {
    tree_updated: Boolean,
    children: [forkSchema],
    data: [
      {
        timestamp: Date,
        count: Number,
      },
    ],
  },
  referrers: [
    {
      name: String,
      data: [
        {
          timestamp: Date,
          count: Number,
          uniques: Number,
        },
      ],
    },
  ],
  contents: [
    {
      path: String,
      title: String,
      data: [
        {
          timestamp: Date,
          count: Number,
          uniques: Number,
        },
      ],
    },
  ],
  nameHistory: [
    {
      date: Date,
      change: String,
    },
  ],
  commits: {
    updated: Boolean,
    data: [
      {
        sha: String,
        message: String,
        timestamp: Date,
      },
    ],
  },
});

export default mongoose.model<IRepository>("Repository", repositorySchema);
