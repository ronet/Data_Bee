const express = require('express'),
    cluster = require('cluster'),
    serverUtils = require('./server-utils');

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    let i;
    for (i = 0; i < 1; i++) {
        cluster.fork();
    }
} else {
    const app = express();

    serverUtils.mongoose(app);
    serverUtils.market(app);

    app.listen(80, () => {
        console.log('Data Bee');
    })
}