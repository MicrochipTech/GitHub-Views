const mongoose = require('mongoose');

const aggregateChartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repo_list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }],
});

const Chart = mongoose.model('Chart', aggregateChartSchema);

module.exports = Chart;
