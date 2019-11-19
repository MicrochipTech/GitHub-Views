const mongoose = require('mongoose');

const aggregateChartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repoId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }],
});

const Chart = mongoose.model('Chart', aggregateChartSchema);

module.exports = Chart;
