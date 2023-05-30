/* this file is strictly for testing db functions. */

const users = require("./users");
const connection = require("../config/mongoConnection");
const songs = require("./songs");

const main = async () => {
    let userid = "61a6934715d92fd4343da59b";
    // try {
    //     const user = await users.create('Marcus', 'Zebrowski', 'mzebrows@stevens.edu',
    //                                     21, 'mzebrows', 'password')
    //     console.log(user)
    // } catch (e) {
    //     console.log(e)
    // }

    // try {
    //     const user = await users.create('Marcus', 'Zebrowski', 'mzebrows@stevens.edu',
    //                                     21, 'mzebrows', 'password')
    // } catch (e) {
    //     console.log(e)
    // }

    // try {
    //     const id = '618a8125cc8852153fe59da1'
    //     const user = await users.addBalance(id, 100000)
    //     console.log(user)
    // } catch (e) {
    //     console.log(e)
    // }

    // try {
    //     await users.addBalance(userid, 1000000);
    //     const id1 = "618efa49a98c1601a7024694";
    //     const song1 = await songs.get(id1);
    //     await users.addSongTransaction(
    //         userid,
    //         new Date(),
    //         id1,
    //         "buy",
    //         song1.price
    //     );
    // } catch (e) {
    //     console.log(e);
    // }

    try {
        // await users.addSongTransaction(userid, 1000000);
        const id1 = "618efa49a98c1601a7024694";
        const song1 = await songs.get(id1);
        await users.addSongTransaction(
            userid,
            new Date(),
            id1,
            "buy",
            song1.price
        );
    } catch (e) {
        console.log(e);
    }
    try {
        const db = await connection();
        await db.s.client.close();
        console.log("Done");
    } catch (e) {
        console.log(e);
    }
};

main();
