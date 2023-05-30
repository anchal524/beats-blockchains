const marketRoutes = require('./market');
const walletRoutes = require('./wallet');
const musicRoutes = require("./songs");
const industryRoutes = require('./industry');
const stockRoutes = require('./stock');
const userRoutes = require('./users');

const path = require('path');

const constructorMethod = (app) => {
    app.use('/users', userRoutes);
    app.use('/market', marketRoutes);
    app.use("/songs", musicRoutes);
    app.use('/wallet', walletRoutes);
    app.use('/industries', industryRoutes);
    app.use('/stock', stockRoutes);
    app.get('/', (req, res) => {
        res.render('extras/home', {authenticated: !!req.session.user, title: 'Beats and Blockchain', authorized: true})
    });

    app.use("*", (req, res) => {
        res.status(404).json({error: "Not found"});
    });
};

module.exports = constructorMethod;
