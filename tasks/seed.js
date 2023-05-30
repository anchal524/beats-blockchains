const connection = require('../config/mongoConnection');
const songsData = require('../data/songs');
const usersData = require('../data/users')
const {songs, users} = require('../config/mongoCollection');

async function main() {
    const db = await connection();
    let songsList = await songsData.getAll();
    if (songsList.length !== 0) {
        await db.collection('songs').drop();
    }

    let usersList = await usersData.getAll()
    if (usersList.length > 0) {
        await db.collection('users').drop()
    }
    let song1 = await songsData.create(
        'You are loved',
        'Stars Go Dim',
        2370,
        'Rock',
        'track 1: STARS, track 2: WALK ON ,...,track 23:NEVER BURN OUT',
        34100,
        24,
        true
    );
    let song2 = await songsData.create(
        'Beautiful Lady',
        'Gyptian',
        8000,
        'Reggae',
        'track 1: BEAUTIFUL LADY, track 2: SAGA CONTINUES',
        7000,
        2,
        true
    );

    let song3 = await songsData.create(
        'FROM THE DINING TABLE',
        'Harry Styles',
        85000,
        'Pop',
        'track 1: FROM THE DINING TABLE, track 2: CAROLINA,....',
        84000,
        11,
        true
    );
    let song4 = await songsData.create(
        'SAFEST',
        'Quando Rondo',
        14500,
        'Pop',
        'track 1: SAFEST, track 2: LULLABY,....',
        14000,
        10,
        true
    );

    let song5 = await songsData.create(
        'HONEYBEE',
        'The Head & The Heart ',
        41000,
        'Pop',
        'track 1: HONEYBEE, track 2: MUSE,....',
        38000,
        15,
        true
    );
    let song6 = await songsData.create(
        'Naturally',
        'Amir Obè',
        35000,
        'Hip hop',
        'track 1: Naturally, track 2: BLOODSHOT,....',
        35000,
        33,
        true
    );
    let song7 = await songsData.create(
        'LUCA BRASI FREESTYLE',
        'Kevin Gates',
        17997,
        'Hip hop',
        'track 1: LUCA BRASI FREESTYLE, track 2: PULL IT OUT,....',
        16000,
        18,
        true
    );
    let song8 = await songsData.create(
        'Yesterday',
        'Chief Keef',
        14300,
        'Hip hop',
        'track 1: Ride, track 2: Bein Famous,....',
        0,
        5,
        true
    );
    let song9 = await songsData.create(
        'Open Your Heart',
        'Madonna',
        188000,
        'pop',
        'track 1: Open Your Heart',
        170000,
        1,
        true
    );

    let song10 = await songsData.create(
        'Breakdown',
        'Tantric',
        72000,
        'pop',
        'track 1: 2 BROTHERS, track 2: 9 ,track 3:AFTER WE GO,..',
        27250,
        123,
        true
    );

    let song11 = await songsData.create(
        'CHANGE LANES',
        'Kevin Gates',
        1200,
        'Hip hop',
        'track 1: CHANGE LANES, track 2: DANGEROUS ,track 3:AFTER WE GO,..',
        0,
        47,
        true
    );

    let song12 = await songsData.create(
        'M A A D CITY',
        'Kendrick Lamar',
        162000,
        'Hip-Hop',
        'track 1: M A A D CITY, track 2: BABIES,....',
        100000,
        34,
        true
    );

    let song13 = await songsData.create(
        '7AM',
        'Lil Uzi Vert',
        115000,
        'Hip-Hop',
        'track 1: 7:00 AM, track 2: ACCESS, track3: AGAIN,....',
        80000,
        7,
        true
    );

    let song14 = await songsData.create(
        'Narcos',
        'Migos',
        84000,
        'Hip-Hop',
        'track 1: KELLY PRICE, track 2: LET ME HIT THAT, track3: KANYE WEST,....',
        50000,
        39,
        true
    );

    let song15 = await songsData.create(
        'BEST I EVER HAD',
        'Drake',
        54348,
        'Hip-Hop',
        'track 1: BEST I EVER HAD,...',
        30000,
        1,
        true
    );

    let song16 = await songsData.create(
        'HEARTBREAK ON A FULL MOON',
        'Chris Brown',
        53419,
        'Hip-Hop',
        'track 1: HEARTBREAK ON A FULL MOON, track 2: DOZEN ROSES,...',
        12500,
        10,
        true
    );

    let song17 = await songsData.create(
        '2012',
        'Chris Brown',
        10000,
        'Hip-Hop',
        'track 1: 2012',
        9000,
        1,
        true
    );

    let song18 = await songsData.create(
        'Chill Bill',
        'Rob $tone',
        8000,
        'Hip-Hop',
        'track 1: Chill Bill',
        5000,
        1,
        true
    );

    let song19 = await songsData.create(
        'Friday',
        'Rebecca Black',
        20000,
        'Hip-Hop',
        'track 1: Friday, track 2: 2020 ON MY MIND,...',
        10000,
        9,
        true
    );

    let song20 = await songsData.create(
        'Stop Cappin',
        'Blueface',
        9000,
        'Hip-Hop',
        'track 1: STOP CAPPIN, track 2: FACE FACTS,...',
        5000,
        4,
        true
    );

    let song21 = await songsData.create(
        'Rise',
        'Danny Gokey',
        10000,
        'Radio Heavy',
        'track 1: Rise, track 2: EVERYTHING COMES ALIVE,...',
        7000,
        8,
        true
    );
    console.log('Done seeding database');

    try {
        const db = await connection();
        await db.s.client.close();
    } catch (e) {
        console.log(e);
    }
}

main();
