const express = require('express');
const {getSpotifyData} = require('../utils/spotifyAPI');
const xss = require('xss');
const {users, songs, industries} = require('../data');
const {getAveragePrice} = require('../data/users');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const username = xss(req.session.user);
        const userData = await users.getByUsername(username);
        let assets = userData.wallet.balance
        let portfolioValue = userData.wallet.balance

        /* For each song call get and query for it's object representation, then put
         that into an array to pass to hbs.*/
      
        const songArr = await Promise.all(
            userData.wallet.holdings.songs.map(async (song) => {
                let songObj = await songs.get(song);
                let result = await getSpotifyData(songObj);
                result._id = song;
                for (const transaction of userData.wallet.transactions.reverse()) {
                    if (transaction._itemId === song) {
                        result.date = transaction.datetime.toDateString()
                        assets += result.price
                        break 
                    }
                }
                return result;
            })
        );
        // Get the current time of the day to greet the user.
        const time = new Date().getHours();
        const greeting =
            time < 12 ? 'morning' : time < 18 ? 'afternoon' : 'evening';

        // Create a new object array from the transactions object to be displayed on the front end.
        const transactions = await Promise.all(
            userData.wallet.transactions.map(async (transaction) => {
                if (!transaction.type) {
                    const {name, artist} = await songs.get(
                        transaction._itemId.toString()
                    );
                    transaction.name = name;
                    transaction.artist = artist;
                } else {
                    const industry = await industries.getIndustry(
                        transaction._itemId.toString()
                    );
                    transaction.name = industry.name;
                    transaction.symbol = industry.symbol;
                }
                return transaction;
            })
        );

        let pnl = 0.0 //profit and loss. this is the value that is shown at the top: You have made ${pnl} Today!
        let stockIds = userData.wallet.holdings.stocks;
        let stocks = [];
        for (const stockId of stockIds) {
            const {name, symbol, lastPrice} = await industries.getIndustry(
                stockId
            );
            const shares = await users.getNumberOfShares(userData._id, stockId);
            if (shares === 0) continue;
            assets += lastPrice * shares
            portfolioValue += lastPrice * shares
            const price = await users.getAveragePrice(userData._id, stockId);
            pnl += (lastPrice - price) * shares
            let ret = (lastPrice - price) / price;
            ret = Math.trunc(ret * 10000) / 100; // in terms of %, contains two decimal places.
            stocks.push({
                _id: stockId,
                name,
                symbol,
                shares,
                price,
                return: ret,
            });
        }

        for (const transaction of userData.wallet.transactions) {
            const today = (new Date()).toDateString()
            if (transaction.pos !== 'sell' || transaction.datetime.toDateString() !== today) {
                continue
            }
            pnl += transaction.pnl
        }

        res.render('extras/wallet', {
            username: userData.firstName,
            assets: assets.toFixed(2),
            time: greeting,
            stocks,
            songs: songArr,
            balance: userData.wallet.balance.toFixed(2),
            transactions: transactions.slice(0, 4),
            pnl: Math.abs(pnl).toFixed(2),
            profit: pnl >= 0,
            total_ret: pnl !== 0 ? (pnl / portfolioValue * 100).toFixed(2) : '0.00',
            title: "Wallet"
        });
    } catch (e) {
        // Error here.
        console.log(e);
        res.status(400).json({error: e});
    }
});

// Buying a song
router.post('/songs/:id', async (req, res) => {
    try {
        // Validate the ID
        // Grab the song data, which will be used for the next function.
        const songId = users.getObjectId(req.params.id).toString();
        const songData = await songs.get(songId);
        // Grab the user to extract their ID.
        const userInfo = await users.getByUsername(req.session.user);
        const userId = userInfo._id.toString();

        // Call songs transaction
        await users.addSongTransaction(
            userId,
            new Date(),
            songId,
            'buy',
            songData.price
        );
        res.redirect('/wallet');
    } catch (e) {
        let songData = await songs.get(req.params.id);
        const songCover = await getSpotifyData(songData);
        res.render('extras/songDetails', {
            title: 'Music Details',
            songs: songData,
            image: songCover.image,
            errors: e,
        });
    }
});

// Selling a song
router.delete('/songs/:id', async (req, res) => {
    const id = xss(req.params.id)
    const username = req.session.user
    let _id;
    try {
        _id = users.getObjectId(id)
    } catch(e) {
        console.log(e);
        res.status(400).json({error: 'Invalid song id.'})
        return
    }
    let song
    try {
        song = await songs.get(id)
    } catch {
        console.log(e);
        res.status(404).json({error: 'Song does not exist.'})
        return
    }
    let user = await users.getByUsername(username)
    if (!(user.wallet.holdings.songs.includes(id))) {
        console.log(id);
        res.status(400).json({error: 'You do not own the rights to this song!'})
        return
    }
    try {
        user = await users.addSongTransaction(user._id, new Date(), id, 'sell', song.price)
    } catch(e) {
        console.log(e)
        res.status(500).json({error: 'Internal Server Error'})
        return
    }
    res.json({balance: user.wallet.balance})
})

// Selling shares of stock
router.delete('/stocks/:id', async (req, res) => {
    const id = xss(req.params.id)
    const username = req.session.user
    const shares = parseInt(xss(req.body.shares))
    let _id

    try {
        _id = users.getObjectId(id)
    } catch {
        res.status(400).json({error: 'Invalid stock id.'})
        return
    }
    if (typeof shares !== 'number' || shares <= 0) {
        res.status(400).json({error: 'Shares must be a number greater than 0.'})
        return
    }
    let industry
    try {
        industry = await industries.getIndustry(id)
    } catch {
        res.status(404).json({error: 'Stock does not exist.'})
        return
    }
    let user = await users.getByUsername(username)
    let stockInHoldings = false
    for (const stockId of user.wallet.holdings.stocks) {
        if (id === stockId) {
            stockInHoldings = true
            break
        }
    }
    if (!stockInHoldings) {
        res.status(400).json({error: 'You do not own that stock.'})
        return
    }
    const ownedShares = await users.getNumberOfShares(user._id, id)
    if (shares > ownedShares) {
        res.status(400).json({error: 'You cannot sell more shares than you own.'})
        return
    }
    try {
        user = await users.addStockTransaction(user._id, new Date(), id, 'sell', industry.lastPrice, shares)
    } catch {
        res.status(500).json({error: 'Internal Server Error'})
        return
    }
    const remainingShares = await users.getNumberOfShares(user._id, id)
    res.json({
        balance: user.wallet.balance, // buying power will change.
        remainingShares // for displaying remaining shares, if any
    })
})

// Buying a stock
router.post('/stocks/:id', async (req, res) => {
    let formData = req.body;
    let errors = []
    //Error Check
    if(!formData.shares){
        errors.push("No Input for Shares")
    }
    let numShares = parseInt(formData.shares)
    if (typeof numShares !== 'number') {
        throw 'Error: Not a Number';
    }
    if (isNaN(numShares)) {
        throw 'Error: Not a Number';
    }
    //Query Database for current price
    const stockId = await users.getObjectId(req.params.id).toString();
    let ind = await industries.getIndustry(stockId);
    if(!ind){
        res.render('extras/market', {
        })
    }
    try {
        // Grab the user to extract their ID.
        const userInfo = await users.getByUsername(req.session.user);
        const userId = userInfo._id.toString();
        // Call songs transaction
        try{
            await users.addStockTransaction(
                userId,
                new Date(),
                req.params.id,
                'buy',
                ind.lastPrice,
                numShares
            );
        }
        catch(e){
            res.render('extras/stock', {
                name: ind.name,
                id: req.params.id,
                symbol: ind.symbol,
                fiftyDayAverage: ind.fiftyDayAverage,
                regularMarketPrice: ind.lastPrice,
                regularMarketDayHigh: ind.regularMarketDayHigh,
                regularMarketDayLow: ind.regularMarketDayLow,
                errors: e
            })
            return
        }
        res.redirect('/wallet');
        return
    } catch (e) {
        res.render('extras/stock', {
            name: ind.name,
            id: req.params.id,
            symbol: ind.symbol,
            fiftyDayAverage: ind.fiftyDayAverage,
            regularMarketPrice: ind.lastPrice,
            regularMarketDayHigh: ind.regularMarketDayHigh,
            regularMarketDayLow: ind.regularMarketDayLow,
            errors: errors
        })
        return
    }
});

router.post('/sell/stock/:id', async (req, res) => {
    let formData = req.body;
    //Error Check
    if(!formData.numStockSharesToSell){
       throw "No Input for Shares"
    }
    let numStockSharesToSell = parseInt(formData.numStockSharesToSell)
    if (typeof numStockSharesToSell !== 'number') {
        throw 'Error: Not a Number';
    }
    if (isNaN(numStockSharesToSell)) {
        throw 'Error: Not a Number';
    }
    //Query Database for current price
    const stockId = await users.getObjectId(req.params.id).toString();
    let ind = await industries.getIndustry(stockId);
    try {
        // Grab the user to extract their ID.
        const userInfo = await users.getByUsername(req.session.user);
        const userId = userInfo._id.toString();
        // Call songs transaction
        try{
            await users.addStockTransaction(
                userId,
                new Date(),
                req.params.id,
                'sell',
                ind.lastPrice,
                numStockSharesToSell
            );
        }
        catch(e){
            res.status(400).json({error: e});
            return
        }
        res.redirect('/wallet');
        return
    } catch (e) {
        res.status(400).json({error: e});
        return
    }
});

router.get('/portfolio_value', async (req, res) => {
    const username = xss(req.session.user);
    try {
        const user = await users.getByUsername(username);
        let portfolioValues = user.wallet.portfolioValues.filter(portfolioValue => {
            portfolioValue.date === (new Date()).toDateString()
        })
        res.json(user.wallet.portfolioValues);
    } catch {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.post('/add_balance', async (req, res) => {
    const username = xss(req.session.user)
    const amt = parseInt(xss(req.body.amt))
    if (typeof amt !== 'number' || amt <= 0) {
        res.status(400).json({error: 'Amount must be a number greater than 0.'})
        return
    }
    const user = await users.getByUsername(username)
    const newBalance = user.wallet.balance + amt
    if (newBalance > 1e6) {
        res.status(400).json({error: "You can only add up to $1,000,000 in buying power."})
        return
    }
    try {
        await users.addBalance(user._id, amt) 
    } catch (e) {
        console.log(e)
        res.status(500).json({error: e})
        return
    }
    res.json({balance: newBalance})
})

module.exports = router;
