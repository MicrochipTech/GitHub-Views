const mongoose = require("mongoose");

const forkSchema = new mongoose.Schema();
forkSchema.add({
  count: Number,    
  repoid: String,
  username: String, 
  full_name: String,
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
  forks: [forkSchema],
  not_found: Boolean
});

const Repository = mongoose.model("Repository", repositorySchema);

module.exports = Repository;