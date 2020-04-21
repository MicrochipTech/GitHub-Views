const mongoose = require("mongoose");

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
  not_found: Boolean
});

const Repository = mongoose.model("Repository", repositorySchema);

module.exports = Repository;
