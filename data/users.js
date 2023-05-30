const {users, industries} = require('../config/mongoCollection');
const {getIndustry, getAllIndustries} = require('./industries');
const {ObjectId} = require('mongodb');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const saltRounds = 16;
const {songs} = require('../config/mongoCollection');
const songsData = require('./songs');

const validEmail = (email) => {
    // more thorough type checking for emails.
    if (typeof email !== 'string') {
        return false;
    }
    const [username, website] = email.split('@');
    if (!username || !website) {
        return false;
    }
    const [domain, tld] = website.split('.');
    if (!domain || !tld) {
        return false;
    }
    if (username.length === 0 || username.match('[^A-Za-z0-9.]+')) {
        return false;
    }
    if (domain.length === 0 || domain.match('[^A-Za-z0-9-]+')) {
        return false;
    }
    if (tld.length === 0 || tld.match('[^A-Za-z0-9-]+')) {
        return false;
    }
    return true;
};

const getObjectId = (id) => {
    if (typeof id !== 'string') {
        throw 'Provided id is not a string.';
    }
    let _id;
    try {
        _id = ObjectId(id);
    } catch {
        throw 'Provided id is not a valid ObjectId.';
    }
    return _id;
};

const getByUsername = async (username) => {
    /* checking that a user with the provided username does not already exist
       before creating document. Password is optional argument to verify that
       user has that password. It should be hashed when passed in. */
    if (typeof username !== 'string' || username.trim().length < 4 || username.match('[^A-Za-z0-9]+')) {
        throw 'Username must be at least 4 characters long and can only contain letters and numbers.'
    }
    username = username.toLowerCase()
    const collection = await users()
    const user = await collection.findOne({username})
    // displaying all the ObjectIds as strings.
    if (user) {
        user._id = user._id.toString()
        for (holdingType of Object.keys(user.wallet.holdings)) {
            user.wallet.holdings[holdingType] = user.wallet.holdings[holdingType].map(holding => holding.toString())
        }
        user.wallet.transactions = user.wallet.transactions.map(transaction => {
            return {
                ...transaction,
                _id: transaction._id.toString(),
                _itemId: transaction._itemId.toString()
            }
        })
    }
    return user
}

const getByEmail = async (email) => {
    if (!validEmail(email)) {
        throw 'Provided email is invalid.';
    }
    email = email.toLowerCase()
    const collection = await users()
    const user = await collection.findOne({email})
    // displaying all the ObjectIds as strings.
    if (user) {
        user._id = user._id.toString()
        for (holdingType of Object.keys(user.wallet.holdings)) {
            user.wallet.holdings[holdingType] = user.wallet.holdings[holdingType].map(holding => holding.toString())
        }
        user.wallet.transactions = user.wallet.transactions.map(transaction => {
            return {
                ...transaction,
                _id: transaction._id.toString(),
                _itemId: transaction._itemId.toString()
            }
        })
    }
    return user
}

const getById = async (id) => {
    // return document of user with provided id.
    const _id = getObjectId(id)
    const collection = await users()
    let user = await collection.findOne({_id})
    if (user) {
        // displaying all the ObjectIds as strings.
        user._id = user._id.toString()
        for (holdingType of Object.keys(user.wallet.holdings)) {
            user.wallet.holdings[holdingType] = user.wallet.holdings[holdingType].map(holding => holding.toString())
        }
        user.wallet.transactions = user.wallet.transactions.map(transaction => {
            return {
                ...transaction,
                _id: transaction._id.toString(),
                _itemId: transaction._itemId.toString()
            }
        })
    }
    return user
}

const getAll = async () => {
    const collection = await users();
    let result = await collection.find().toArray();
    result = result.map((user) => {
        user._id = user._id.toString();
        for (holdingType of Object.keys(user.wallet.holdings)) {
            user.wallet.holdings[holdingType] = user.wallet.holdings[
                holdingType
            ].map((holding) => holding.toString());
        }
        user.wallet.transactions = user.wallet.transactions.map(
            (transaction) => {
                return {
                    ...transaction,
                    _id: transaction._id.toString(),
                    _itemId: transaction._itemId.toString(),
                };
            }
        );
        return user;
    });
    return result;
};

const create = async (firstName, lastName, email, age, username, password) => {
    /* this method should run whenever someone creates a new account. password 
       should be hashed when passed in. */
    if (
        typeof firstName !== 'string' ||
        firstName.trim().length === 0 ||
        firstName.match('[^A-Za-z]+')
    ) {
        throw 'First name can only contain letters.';
    }
    if (
        typeof lastName !== 'string' ||
        lastName.trim().length === 0 ||
        lastName.match('[^A-Za-z]+')
    ) {
        throw 'Last name can only contain letters.';
    }
    if (typeof age !== 'number' || age < 18) {
        throw 'User must be at least 18 years old.';
    }
    if (!validEmail(email)) {
        throw 'Email is not valid.';
    }
    if (
        typeof username !== 'string' ||
        username.trim().length < 4 ||
        username.match('[^A-Za-z0-9]+')
    ) {
        throw 'Username must be at least 4 characters long and can only contain letters and numbers.';
    }
    let user = await getByUsername(username);
    if (user) {
        throw 'Provided username is unavailable.';
    }
    if (
        typeof password !== 'string' ||
        password.trim().length < 8 ||
        password.match('[ ]+')
    ) {
        throw 'Password must be at least 8 characters long and cannot contain spaces.';
    }
    const hash = await bcrypt.hash(password, saltRounds);
    const collection = await users();
    user = await getByEmail(email);
    if (user) {
        throw 'Email is already taken.';
    }

    const date = new Date();
    const {insertedId} = await collection.insertOne({
        firstName,
        lastName,
        age,
        email,
        username: username.toLowerCase(),
        password: hash,
        wallet: {
            holdings: {
                stocks: [],
                songs: [],
            },
            balance: 0.0,
            portfolioValues: [
                {
                    date: date.toDateString(),
                    value: 0,
                },
            ],
            transactions: [],
        },
    });

    const result = await getById(insertedId.toString());
    return result;
};

const addBalance = async (id, amt) => {
    // add to the balance of a user.
    const _id = getObjectId(id);
    if (typeof amt !== 'number' || amt <= 0) {
        throw 'Added amount must be a number greater than 0.';
    }
    let user = await getById(id)
    if (!user) {
        throw 'User not founded with the provided id.'
    }
    if (user.wallet.balance + amt > 1e6) {
        throw 'You cannot add more to your balance when it is past $1,000,000.'
    }
    const collection = await users()
    const updateInfo = await collection.updateOne({_id}, {$inc: {'wallet.balance': amt}})
    if (updateInfo.matchedCount === 0) {
        throw 'User not found with the provided id.';
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update balance for user.';
    }
    user = await getById(id);
    return user;
};

const getNumberOfShares = async (userId, stockId) => {
    // calculates the total number of shares a user has of a particular stock.
    const _userId = getObjectId(userId);
    const _stockId = getObjectId(stockId);
    const user = await getById(userId);
    if (!user) {
        throw 'Could not find user with id.'
    }
    const industry = await getIndustry(stockId);
    const {transactions} = user.wallet;
    return transactions
        .filter((transaction) => transaction._itemId === stockId)
        .map(
            (transaction) =>
                transaction.shares * (transaction.pos === 'buy' ? 1 : -1)
        )
        .reduce((a, b) => a + b, 0);
};

const getAveragePrice = async (userId, stockId) => {
    const _userId = getObjectId(userId);
    const _stockId = getObjectId(stockId);
    const user = await getById(userId);
    if (!user) {
        throw 'No user found!'
    }
    const industry = await getIndustry(stockId)
    const totalShares = await getNumberOfShares(userId, stockId);
    let {transactions} = user.wallet;
    // transactions = transactions.filter(
        // (transaction) => (transaction._itemId === stockId && transaction.pos === 'buy')
    // );
    if (totalShares === 0) {
        throw 'User does not own any of this stock.';
    }
    let count = totalShares;
    let averagePrice = 0.0;
    for (let i = transactions.length - 1; i >= 0 && count > 0; --i) {
        if (transactions[i]._itemId === stockId && transactions[i].pos === 'buy') {
            let {shares, price} = transactions[i];
            if (shares > totalShares) {
                shares = totalShares
            }
            averagePrice += (price * shares) / totalShares;
            count -= shares;
        }
    }
    return averagePrice;
};

const calculatePortfolioValue = async (userId) => {
    const _userId = getObjectId(userId);
    let user = await getById(userId);
    if (!user) {
        throw 'Could not find user with that id.'
    }
    const industries = await getAllIndustries();
    let value = 0.0;
    let pnl = 0.0;
    for (const industry of industries) {
        const shares = await getNumberOfShares(userId, industry._id);
        if (shares === 0) {
            continue
        }
        const averagePrice = await getAveragePrice(userId, industry._id)
        value += shares * industry.lastPrice;
        pnl += (industry.lastPrice - averagePrice) * shares
    }
    value += user.wallet.balance

    for (const transaction of user.wallet.transactions) {
        const today = (new Date()).toDateString()
        if (transaction.pos !== 'sell' || transaction.datetime.toDateString() !== today) {
            continue
        }
        pnl += transaction.pnl
    }
    // Force to two decimal places, and do not round.
    
    const date = new Date()
    const collection = await users()

    if (value === 0) {
        throw 'The portfolio value for the user is 0.'
    }

    let ret = Math.trunc(pnl / value * 10000) / 100
    const updateInfo = await collection.updateOne({_id: _userId}, {
        $push: {
            'wallet.portfolioValues': {
                date: date.toDateString(), 
                value: ret
            }
        }
    });
    user = await getById(userId);
    return user.wallet.portfolioValues;
};

const addStockTransaction = async (
    userId,
    datetime,
    stockId,
    pos,
    price,
    shares
) => {
    /* this will add a stock transaction to the transactions array for the user.
       the only difference is that this subdocument will include a shares key.
       this will also update holdings (e.g. they buy a new stock or they sell out of
       one completely) as well as balance. as a side note: another function. */
    const _userId = getObjectId(userId);
    const _stockId = getObjectId(stockId);
    if (!(datetime instanceof Date)) {
        throw 'Must provide a valid Date object.';
    }
    if (typeof pos !== 'string' || (pos !== 'buy' && pos !== 'sell')) {
        throw 'Pos must either be "buy" or "sell".';
    }
    if (typeof price !== 'number' || price <= 0) {
        throw 'Price must be a number greater than 0.';
    }
    if (typeof shares !== 'number' || shares <= 0) {
        throw 'Shares must be a number greater than 0.';
    }
    const user = await getById(userId);
    if (pos === 'buy' && price * shares > user.wallet.balance) {
        throw 'User does not have enough money to make this transaction.';
    }
    const oldShareAmount = await getNumberOfShares(userId, stockId);
    const newShareAmount = oldShareAmount + shares;
    if (pos === 'sell' && (shares <= 0 || shares > oldShareAmount)) {
        throw 'User cannot sell that many shares.';
    }

    let averagePrice
    if (pos === 'sell') {
        averagePrice = await getAveragePrice(userId, stockId) // i only need to calculate pnl on sells.
    } else {
        averagePrice = 0.0
    }
    const transaction = {
        _id: new ObjectId(),
        datetime,
        type: 1,
        _itemId: _stockId,
        price,
        shares,
        pos,
        pnl: pos === 'sell' ? (price - averagePrice) * shares : 0.0 // if it is a buy transaction then no pnl.
    };
    const collection = await users();
    let updateInfo = await collection.updateOne(
        {_id: _userId},
        {
            $push: {'wallet.transactions': transaction},
            $inc: {'wallet.balance': price * shares * (pos === 'buy' ? -1 : 1)},
        }
    );
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.';
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user transactions history and balance after transaction.';
    }
    if (oldShareAmount === 0) {
        updateInfo = await collection.updateOne(
            {_id: _userId},
            {$push: {'wallet.holdings.stocks': stockId}}
        );
        if (updateInfo.modifiedCount === 0) {
            throw 'Failed to add stock to holdings array.'
        }
    } else if (newShareAmount === 0) {
        updateInfo = await collection.updateOne(
            {_id: _userId},
            {$pull: {'wallet.holdings.stocks': stockId}}
        );
    }
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.';
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user holdings after transaction.';
    }
    const result = await getById(userId);
    return result;
};

const sellStockTransaction = async (
    userId,
    datetime,
    stockId,
    pos,
    price,
    sharesToSell
) => {
    const _userId = getObjectId(userId);
    const _stockId = getObjectId(stockId);
    if (!(datetime instanceof Date)) {
        throw 'Must provide a valid Date object.';
    }
    if (typeof pos !== 'string' || pos !== 'sell') {
        throw 'Pos must be "sell".';
    }
    if (typeof price !== 'number' || price <= 0) {
        throw 'Price must be a number greater than 0.';
    }
    if (typeof sharesToSell !== 'number' || sharesToSell <= 0) {
        throw 'Shares must be a number greater than 0.';
    }
    const numShares = await getNumberOfShares(userId, stockId);
    if (numShares < sharesToSell) {
        throw 'Error: Cannot sell more shares than owned';
    }
    const transaction = {
        _id: new ObjectId(),
        datetime,
        type: 1,
        _itemId: _stockId,
        price,
        shares,
        pos,
    };
    const collection = await users();
    let updateInfo = await collection.updateOne(
        {_id: _userId},
        {
            $push: {'wallet.transactions': transaction},
            $inc: {'wallet.balance': price * shares * (pos === 'buy' ? -1 : 1)},
        }
    );
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.';
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user transactions history and balance after transaction.';
    }
    updateInfo = await collection.updateOne(
        {_id: _userId},
        {$pull: {'wallet.holdings.stocks': _stockId}}
    );
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.';
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user transactions history and balance after transaction.';
    }
    const result = await getById(userId);
    return result;
};

const addSongTransaction = async (userId, datetime, songId, pos, price) => {
    /* this will add a stock transaction to the transactions array for the user.
       the only difference is that this subdocument will include a shares key.
       this will also update holdings (e.g. they buy a new stock or they sell out of
       one completely) as well as balance. as a side note: another function. */
    const _userId = getObjectId(userId);
    const _songId = getObjectId(songId);
    if (!(datetime instanceof Date)) {
        throw 'Must provide a valid Date object.';
    }
    if (typeof pos !== 'string' || (pos !== 'buy' && pos !== 'sell')) {
        throw 'Position must either be "buy" or "sell".';
    }
    if (typeof price !== 'number' || price <= 0) {
        throw 'Price must be a number greater than 0.';
    }
    const songDetails = await songsData.get(songId);
    if (pos === 'buy' && songDetails.currentlyAvailable === false) {
        throw 'Sorry song cannot be bought.It is already sold out';
    }

    if (pos === 'sell' && songDetails.currentlyAvailable === true) {
        throw 'Sorry song cannot be sold.It has already been sold';
    }

    const transaction = {
        _id: new ObjectId(),
        datetime,
        type: 0,
        _itemId: _songId,
        price,
        pos,
    };
    const user = await getById(userId);
    if (pos === 'buy' && user.wallet.balance < price) {
        throw 'User cannot afford to buy the rights to this music.';
    }
    if (pos === 'sell' && !(user.wallet.holdings.songs.includes(songId))) {
        throw 'User does not own the rights to the music that they are trying to sell.';
    }

    const collection = await users();
    let updateInfo = await collection.updateOne(
        {_id: _userId},
        {
            $push: {'wallet.transactions': transaction},
            $inc: {'wallet.balance': price * (pos === 'buy' ? -1 : 1)},
        }
    );
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.';
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user transactions history and balance after transaction.';
    }
    const songsCollection = await songs();

    let currAvailabilityFlag = false;
    if (pos === 'sell') {
        currAvailabilityFlag = true;
    }
    const updateSongInfo = {
        currentlyAvailable: currAvailabilityFlag,
    };
    let updatedSongInfo = '';
    if (pos === 'buy') {
        updateInfo = await collection.updateOne(
            {_id: _userId},
            {$push: {'wallet.holdings.songs': songId}}
        );
        updatedSongInfo = await songsCollection.updateOne(
            {_id: _songId},
            {$set: updateSongInfo}
        );
    } else {
        updateInfo = await collection.updateOne(
            {_id: _userId},
            {$pull: {'wallet.holdings.songs': songId}}
        );
        updatedSongInfo = await songsCollection.updateOne(
            {_id: _songId},
            {$set: updateSongInfo}
        );
    }
    if (updateInfo.matchedCount === 0) {
        throw 'Could not find user with the provided id.';
    }
    if (updateInfo.modifiedCount === 0) {
        throw 'Failed to update user holdings after transaction.';
    }

    if (updatedSongInfo.modifiedCount === 0) {
        throw 'Failed to update song availability after transaction.';
    }
    const result = await getById(userId);
    return result;
};

module.exports = {
    getObjectId,
    validEmail,
    getByUsername,
    getByEmail,
    getById,
    getAll,
    create,
    getNumberOfShares,
    getAveragePrice,
    addBalance,
    addStockTransaction,
    sellStockTransaction,
    addSongTransaction,
    calculatePortfolioValue,
};
