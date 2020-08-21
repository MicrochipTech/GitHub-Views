const mongoose = require("mongoose");

const forkSchema = new mongoose.Schema();
forkSchema.add({
  github_repo_id: String,
  reponame: String,
  count: Number,
  children: [forkSchema]
});

const repositorySchema = new mongoose.Schema({
  not_found: Boolean,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  users: [ { type: mongoose.Schema.Types.ObjectId, ref: "User" } ],
  github_repo_id: String,
  reponame: String,
  count: Number,
  uniques: Number,
  views: [
    {
      timestamp: Date,
      count: Number,
      uniques: Number
    }
  ],
  clones: {
    total_count: Number,
    total_uniques: Number,
    data: [
      {
        timestamp: Date,
        count: Number,
        uniques: Number
      }
    ]
  },
  forks: {
    tree_updated: Boolean,
    children: [forkSchema],
    data: [
      {
        timestamp: Date,
        count: Number
      }
    ]
  },
  referrers: [
    {
      name: String,
      data: [
        {
          timestamp: Date,
          count: Number,
          uniques: Number
        }
      ]
    }
  ],
  contents: [
    {
      path: String,
      title: String,
      data: [
        {
          timestamp: Date,
          count: Number,
          uniques: Number
        }
      ]
    }
  ],
  nameHistory: [
    {
      date: Date,
      change: String
    }
  ]
});

const Repository = mongoose.model("Repository", repositorySchema);

module.exports = Repository;
