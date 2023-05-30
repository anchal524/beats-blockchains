const {industries} = require("../config/mongoCollection");
const {ObjectId} = require("mongodb");
var axios = require("axios").default;

// Industry names will be provided from an API.
// These functions will only be displayed in Admin view.

const idValidator = (id) => {
    if(!id) throw "Error: No ID provided.";
    if(id.trim().length === 0) throw "Error: Your input cannot be all whitespace";
    
    if(!ObjectId.isValid(id)) throw "Error: ObjectId is not of proper format.";
    let convertedId = ObjectId(id);

    return convertedId;
}

function validateStringParams(param, paramName) {
    if (!param) {
        throw `Error: No ${paramName} passed to the function`;
    } else if (typeof param !== "string") {
        throw `Type Error: Argument ${param} passed is not a string ${paramName}`;
    } else if (param.length === 0) {
        throw `Error: No element present in string ${paramName}`;
    } else if (!param.trim()) {
        throw `Error: Empty spaces passed to string ${paramName}`;
    }
}

const createIndustry = async (name, symbol) => {
    validateStringParams(name, "name")
    validateStringParams(symbol, "symbol")
    let newIndustry = {
        name: name,
        symbol: symbol
    }
    const industryCollection = await industries();
    const industryInfo = await industryCollection.insertOne(newIndustry);
    if (industryInfo.insertedCount === 0) {
        throw 'Could not add industry';
    }
    return 0;
}

const getIndustry = async (id) => {
    const industryId = idValidator(id);
    
    const industryCollection = await industries();
    const foundIndustry = await industryCollection.findOne({ _id: industryId});

    if(foundIndustry === null) throw "Error: No industry with that ID.";
    foundIndustry._id = foundIndustry._id.toString();

    return foundIndustry;
}

const getAllIndustries = async() => {
    const industryCollection = await industries();
    const allIndustries = await industryCollection.find({}).toArray();

    allIndustries.forEach(industry => {
        industry._id = industry._id.toString();
    });

    return allIndustries;
}


const financeAPI = async(symbol) => {
    validateStringParams(symbol, "symbol")
    var options = {
    method: 'GET',
    url: 'https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=' + symbol,
    params: {modules: 'defaultKeyStatistics,assetProfile'},
    headers: {
        'x-api-key': 'cIbXzdZfgs4mpo8tDVy3S3gbjIELpOYqaNJuYhKn'
    }
    };
    let returnVal = 0
    await axios.request(options).then(function (response2) {
        returnVal = response2.data
    }).catch(function (error) {
        console.error(error);
    });
    return returnVal
}

const fetchStockPrices = async () => {
    const stocks = await getAllIndustries()
    const tickers = stocks.map(industry => industry.symbol)
    if (tickers.length === 0) {
        throw 'No industries found!'
    }
    const response = await axios.get('https://yfapi.net/v6/finance/quote', {
        params: {
            symbols: tickers.reduce((tickerA, tickerB) => `${tickerA},${tickerB}`, '')
        },
        headers: {
            'x-api-key': 'cIbXzdZfgs4mpo8tDVy3S3gbjIELpOYqaNJuYhKn'
        }
    })
    const stockData = response.data.quoteResponse.result
    const collection = await industries()
    for (const stock of stockData) {
        for (const industry of stocks) {
            if (industry.symbol === stock.symbol) {
                const lastPrice = stock.regularMarketPrice
                const lastPriceTime = new Date()
                const {
                    regularMarketDayLow,
                    regularMarketDayHigh,
                    fiftyDayAverage
                } = stock
                const _id = idValidator(industry._id)
                const updateInfo = await collection.updateOne({_id}, {$set: {
                    lastPrice, 
                    lastPriceTime,
                    regularMarketDayLow,
                    regularMarketDayHigh,
                    fiftyDayAverage
                }})
                if (updateInfo.matchedCount === 0) {
                    throw 'Could not find industry with the provided id.'
                }
                if (updateInfo.modifiedCount === 0) {
                    throw 'Failed to update stock price.'
                }
                break
            }
        }
    }
}

module.exports = {
    createIndustry,
    getIndustry, 
    getAllIndustries,
    financeAPI,
    fetchStockPrices
};