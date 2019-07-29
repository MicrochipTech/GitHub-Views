var CatModel = require('../models/Cat');

module.exports = {
    getAll: () => {
        return CatModel.find();
    },

    create: (name) => {
        var cat = new CatModel({name: name});
        return cat.save();
    },
};
