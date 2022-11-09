const spicedPg = require("spiced-pg");

const { DATABASE_USERNAME, DATABASE_PASSWORD } = require("./secrets.json");
const DATABASE_NAME = "spiced-petition"; // it can be whatever you want
const DATABASE_URL = `postgres:${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`;

const db = spicedPg(DATABASE_URL);

console.log(`[spiced-petition:db] connecting to database`);

// plural method - should return an array (result.rows)
function getSignatures() {
    return db.query(`SELECT * FROM signatures`).then((result) => result.rows);
}

// singular method - should return the first entry of result.rows
/* function getSignaturesById(id) {
    return db
        .query(`SELECT * FROM signatures WHERE id = $1`, [id])
        .then((result) => result.rows[0]);
} */

function newSignature(first_name, last_name, signature) {
    return db
        .query(
            `INSERT INTO signatures (first_name, last_name, signature)
        VALUES ($1, $2, $3)
        RETURNING *`,
            [first_name, last_name, signature]
        )
        .then((result) => result.rows[0]);
}
/* function editUser({
    first_name,
    last_name,
    signature
}) {
    return db
        .query(
            `UPDATE users
    SET first_name = $1, last_name = $2, email = $3, profile_picture_url = $4
    WHERE id = $5`,
            [first_name, last_name, email, profile_picture_url, user_id]
        )
        .then((result) => result.rows[0]); */
/* } */
module.exports = {
    getSignatures,
    newSignature,
    /* getSignaturesById, */
    /* newUser,
    editUser,  */
};
