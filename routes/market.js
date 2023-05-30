const express = require('express');
const router = express.Router();
const {users, songs, industries} = require('../data');
const xss = require('xss');

router.get('/', async (req, res) => {
    const username = xss(req.session.user);
    const userData = await users.getByUsername(username);
    let assets = userData.wallet.balance
    res.render('extras/market', {
        balance: assets.toFixed(2),
        title: "Market"
    })
})

module.exports = router;