const mongoose = require("mongoose");

const forkSchema = new mongoose.Schema();
forkSchema.add({
  github_repo_id: String,
  reponame: String,
  count: Number,
  children: [forkSchema]
})

const repositorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
  not_found: Boolean
});

const Repository = mongoose.model("Repository", repositorySchema);

module.exports = Repository;
