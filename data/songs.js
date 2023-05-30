const {songs} = require('../config/mongoCollection');
const {ObjectId} = require('mongodb');

function validateStringParams(param, paramName) {
    if (!param) {
        throw `Error: No ${paramName} passed to the function`;
    } else if (typeof param !== 'string') {
        throw `Type Error: Argument ${param} passed is not a string ${paramName}`;
    } else if (param.length === 0) {
        throw `Error: No element present in string ${paramName}`;
    } else if (!param.trim()) {
        throw `Error: Empty spaces passed to string ${paramName}`;
    }
}

function validateNumberParams(param, paramName) {
    if (typeof param !== 'number' || !Number.isInteger(param)) {
        throw `Type Error: Argument ${param} passed is not a numeric ${paramName}`;
    }
    if (param < 0) {
        throw `${paramName} can not be negative`;
    }
}

function validateBoolParams(param, paramName) {
    if (!param) {
        throw `Error: No ${paramName} passed to the function`;
    }
    if (typeof param != 'boolean') {
        throw `Type Error: Argument ${param} passed is not a boolean ${paramName}`;
    }
}

async function get(searchId) {
    validateStringParams(searchId, 'song id');
    searchId = searchId.trim();
    if (!ObjectId.isValid(searchId)) {
        throw `Error : Id passed in must be a Buffer or string of 12 bytes or a string of 24 hex characters`;
    }
    let parseId = ObjectId(searchId);
    const songsCollection = await songs();
    const songFound = await songsCollection.findOne({_id: parseId});
    if (songFound === null) {
        throw `No song found with the id ${searchId}`;
    } else {
        songFound['_id'] = searchId;
    }
    return songFound;
}

async function getAll() {
    const songsCollection = await songs();
    const songsList = await songsCollection
        .find({currentlyAvailable: {$eq: true}})
        .toArray();
    if (songsList.length === 0) {
        return [];
    }
    return songsList;
}
function validateCreations(
    name,
    artist,
    price,
    genre,
    description,
    lastSoldPrice,
    numberOfTracks,
    currentlyAvailable
) {
    validateStringParams(name, 'song name');
    validateStringParams(artist, 'artist name');
    validateNumberParams(price, 'Price');
    validateStringParams(genre, 'genre');
    validateStringParams(description, 'description');
    validateNumberParams(lastSoldPrice, 'last sold price');
    validateNumberParams(numberOfTracks, 'number of tracks');
    validateBoolParams(currentlyAvailable, 'currently available flag');
}

async function create(
    name,
    artist,
    price,
    genre,
    description,
    lastSoldPrice,
    numberOfTracks,
    currentlyAvailable
) {
    validateCreations(
        name,
        artist,
        price,
        genre,
        description,
        lastSoldPrice,
        numberOfTracks,
        currentlyAvailable
    );
    name = name.trim();
    artist = artist.trim();
    genre = genre.trim();
    description = description.trim();
    const songsCollection = await songs();
    let newSong = {
        name: name,
        artist: artist,
        price: price,
        genre: genre,
        description: description,
        lastSoldPrice: lastSoldPrice,
        numberOfTracks: numberOfTracks,
        currentOwner: 'None',
        currentlyAvailable: currentlyAvailable,
    };
    const insertedDatadetails = await songsCollection.insertOne(newSong);
    if (insertedDatadetails.insertedCount === 0) {
        throw 'Song could not be inserted';
    }

    const songId = insertedDatadetails.insertedId.toString();

    const songDetails = await get(songId);
    return songDetails;
}

module.exports = {create, get, getAll};
