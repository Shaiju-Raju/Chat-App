import pool from "../config/db.js";


export const saveMessage = async (room ,sender,text,time) => {

    const result = await pool.query(
        "INSERT INTO messages (room, sender, text, time) VALUES ($1,$2,$3,$4)",
        [room, sender, text, time]
    );

    return result.rows[0];

}


export const getRoomMessage = async (room) => {
    const result = await pool.query(
        "SELECT * FROM messages WHERE room = $1",
        [room]
    );
    return result.rows[0];
}