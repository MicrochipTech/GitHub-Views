var mongoose = require('mongoose');

var historyItemSchema = new mongoose.Schema({
  timestamp: Date,
  views: Number,
  unique: Number,
}, {_id: false});

var repoHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  repoId: String,
  repoName: String,
  history: [historyItemSchema]
});

var RepoHistory = mongoose.model('RepoHistory', repoHistorySchema);

module.exports = RepoHistory;
