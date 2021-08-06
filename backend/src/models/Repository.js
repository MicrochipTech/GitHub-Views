const mongoose = require("mongoose");

const forkSchema = new mongoose.Schema();
forkSchema.add({
  github_repo_id: String,
  reponame: String,
  count: Number,
  children: [forkSchema],
});

const repositorySchema = new mongoose.Schema({
  not_found: Boolean,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  github_repo_id: String,
  reponame: {
    type:String,
    unique: true, // this is important!! (it creates an index in the db)
  },
  private: Boolean,
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

const Repository = mongoose.model("Repository", repositorySchema);

module.exports = Repository;
