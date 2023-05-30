const {industries} = require("../data/");
const connection = require("../config/mongoConnection");

const main = async() => {
    const db = await connection()
    const industryObjects = await industries.getAllIndustries()
    if (industryObjects.length > 0) {
        await db.collection('industries').drop();
    }

    try {
        const spotify = await industries.createIndustry("Spotify", "SPOT");
    }
    catch(e) {
        console.log(e);
    }

    try {
        const sirius = await industries.createIndustry("Sirius XM", "SIRI");
    }
    catch(e) {
        console.log(e);
    }

    try {
        const heart = await industries.createIndustry("iHeart Media Inc", "IHRT");
    }
    catch(e) {
        console.log(e);
    }

    try {
        const heart = await industries.createIndustry("Sonos", "SONO");
    }
    catch(e) {
        console.log(e);
    }

    try {
        const heart = await industries.createIndustry("Live Nation Entertainment", "LYV");
    }
    catch(e) {
        console.log(e);
    }

    try {
        const heart = await industries.createIndustry("Warner Music Group", "WMG");
    }
    catch(e) {
        console.log(e);
    }

    try {
        const db = await connection();
        await db.s.client.close();
    } catch (e) {
        console.log(e);
    }

}

main();