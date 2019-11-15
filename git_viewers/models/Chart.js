var mongoose = require('mongoose');

var repositorySchema = new mongoose.Schema({
    userId: userId,
    
    repoId: [{type: mongoose.Schema.Types.ObjectId, ref: 'Repository'}]
});

var Chart = mongoose.model('Chart', chartSchema);

module.exports = Chart;