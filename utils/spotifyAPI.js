const qs = require('qs');
const axios = require('axios');
require('dotenv').config();

const getAccessToken = async () => {
    const data = {
        grant_type: 'client_credentials'
    };
    const headers = {
        headers: {
            'Authorization': 'Basic ' + Buffer.from(
                process.env.CLIENTID + ':' + process.env.CLIENTSECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    const response = await axios.post('https://accounts.spotify.com/api/token',
        qs.stringify(data),
        headers
    );
    
    const spotifyKey = response.data.access_token;
    return spotifyKey;
}

const getSpotifyData = async(songObj) => {
    let track = encodeURIComponent(songObj.name);
    let artist = encodeURIComponent(songObj.artist);
    const response = await axios.get(`https://api.spotify.com/v1/search?q=track%3A${track}+artist%3A${artist}&type=track&limit=1`, {
        headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getAccessToken()}`
            }
        });
    songObj.image = response.data.tracks.items[0].album.images[1].url;
    return songObj;
}

module.exports = {
    getSpotifyData
}