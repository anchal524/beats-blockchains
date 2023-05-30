const express = require('express');
const router = express.Router();
const stocksData = require("../data/industries");
const {users, songs, industries} = require('../data');
const xss = require('xss');

router.get('/', async (req, res) => {
    let stockList = await stocksData.getAllIndustries();
    const username = xss(req.session.user);
    const userData = await users.getByUsername(username);
    let assets = userData.wallet.balance
    res.render('extras/industry', {
        industries: stockList,
        balance: assets.toFixed(2),
        title: "Industries"
    })
})

module.exports = router
