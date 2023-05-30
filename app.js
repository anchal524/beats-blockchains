const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const session = require('express-session')

const {users, industries} = require('./data')

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(session({
    name: "AuthCookie",
    secret: "$8r}{W04X,a%x>]L]1zA",
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 900000} // 15 minutes
}))

app.use('/', async (req, res, next) => {
    const routePath = req.path.split('/')
    const loggedIn = !!req.session.user
    if (req.method !== 'GET') {
        next()
        return
    }

    if ((!loggedIn && (routePath[1] !== 'users' && routePath[1] !== '')) || (loggedIn && routePath[1] === 'users' && routePath[2] !== 'logout')) {
        res.status(403).render('extras/home', {title: 'Beats and Blockchain', authenticated: loggedIn, authorized: false})
    } else {
        next()
    }
})

configRoutes(app);

// creates an interval to keep getting the stock prices
setTimeout(async () => {
    try {
        await industries.fetchStockPrices()
    } catch (e) {
        console.log(e)
    }
})

let stockPriceRoutine
setInterval(() => {
    const date = new Date()
    let month = date.getMonth() + 1
    month = month >= 10 ? month.toString() : '0' + month.toString()
    let day = date.getDate()
    day = day >= 10 ? day.toString() : '0' + day.toString()
    const year = date.getFullYear()

    const market_open = new Date(`${year}-${month}-${day}T09:30:00`)
    const market_close = new Date(`${year}-${month}-${day}T16:00:00`)

    if (!stockPriceRoutine && date >= market_open && date <= market_close) {
        stockPriceRoutine = setInterval(async () => {
            try {
                await industries.fetchStockPrices()
            } catch (e) {
                console.log(e)
                return
            }
            const allUsers = await users.getAll()
            for (const user of allUsers) {
                try {
                    await users.calculatePortfolioValue(user._id)
                } catch (e) {
                    continue
                }
            }
        }, 60000) // every minute update stock prices.
    } else if (stockPriceRoutine && date > market_close) {
        clearInterval(stockPriceRoutine)
    }
}, 10000) // checks every 10 seconds

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});