const express = require('express');
const router = express.Router();
const {users, songs, industries} = require('../data');
const xss = require('xss');

router.get('/:id', async (req, res) => {
    const stockId = await users.getObjectId(req.params.id).toString();
    let ind = await industries.getIndustry(stockId);
    const username = xss(req.session.user);
    const userData = await users.getByUsername(username);
    let assets = userData.wallet.balance
    res.render('extras/stock', {
        balance: assets.toFixed(2),
        name: ind.name,
        id: req.params.id,
        symbol: ind.symbol,
        fiftyDayAverage: ind.fiftyDayAverage,
        regularMarketPrice: ind.lastPrice,
        regularMarketDayHigh: ind.regularMarketDayHigh,
        regularMarketDayLow: ind.regularMarketDayLow,
        title: "Stocks"
    })
})

module.exports = router