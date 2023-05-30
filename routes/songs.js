const express = require("express");
const songsData = require("../data/songs");
const {getSpotifyData} = require("../utils/spotifyAPI");
const router = express.Router();
const {users, songs, industries} = require('../data');
const xss = require('xss');

function validateStringParams(param, paramName) {
    if (!param) {
        throw `No ${paramName} passed in the request`;
    } else if (typeof param !== "string") {
        throw `Argument ${param} passed is not a string ${paramName}`;
    } else if (param.length === 0) {
        throw `No element present in string ${paramName}`;
    } else if (!param.trim()) {
        throw `Empty spaces passed to string ${paramName}`;
    }
}
router.get("/", async (req, res) => {
    try {
        const username = xss(req.session.user);
        const userData = await users.getByUsername(username);
        let assets = userData.wallet.balance
        let songsList = await songsData.getAll();
        res.render("extras/songs", {
            title: "Music Rights Page",
            songs: songsList,
            balance: assets.toFixed(2)
            
        });
    } catch (e) {
        res.render("extras/error", {
            title: "Error",
            httpStatusCode: "500",
            errorMessage:
                "Oops! Our website has some internal error. Please visit this page later",
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        validateStringParams(req.params.id, "Song Id");
        let songs = await songsData.get(req.params.id);
        const songCover = await getSpotifyData(songs);
        const username = xss(req.session.user);
        const userData = await users.getByUsername(username);
        let assets = userData.wallet.balance
        res.render("extras/songDetails", {
            title: "Music Details",
            songs: songs,
            image: songCover.image,
            balance: assets.toFixed(2)
        });
    } catch (e) {
        res.render("extras/error", {
            title: "Error",
            httpStatusCode: "400",
            errorMessage: e,
        });
    }
});

module.exports = router;
