module.exports = (app) => {
    const mongoose = require('mongoose'),
        schemas = require('../schemas');

    const mongo = {
        host: 'localhost',
        port: 27017,
        user: 'root',
        database: 'dataBee',
    }
    const setting = {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    }

    mongoose.connect(`mongodb://${mongo.host}:${mongo.port}/${mongo.database}`, setting);



    Object.keys(schemas).forEach((key) => {
        mongoose[key] = mongoose.model(key, new mongoose.Schema(schemas[key]));
    })
    app.set('mongoose', mongoose);
}