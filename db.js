const spicedPg = require("spiced-pg");
const { hash, genSalt, compare } = require("bcryptjs");
const { DATABASE_USERNAME, DATABASE_PASSWORD } = require("./secrets.json");
const DATABASE_NAME = "spiced-petition"; // it can be whatever you want
const DATABASE_URL = `postgres:${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`;

const db = spicedPg(DATABASE_URL);

console.log(`[spiced-petition:db] connecting to database`);

async function hashPassword(password) {
    const salt = await genSalt();
    return hash(password, salt);
}

// plural method - should return an array (result.rows)
function getSignatures() {
    return db
        .query(
            `SELECT first_name, last_name, age, city, url 
            FROM users 
            INNER JOIN signatures ON users.id = signatures.user_id
            INNER JOIN user_profiles ON users.id = user_profiles.user_id`
        )
        .then((result) => result.rows);
}

// singular method - should return the first entry of result.rows
function getSignatureById(user_id) {
    return db
        .query(`SELECT * FROM signatures WHERE id = $1`, [user_id])
        .then((result) => result.rows[0]);
}

function newSignature({ signature }, { user_id }) {
    return db
        .query(
            `INSERT INTO signatures (signature, user_id)
        VALUES ($1, $2)
        RETURNING *`,
            [signature, user_id]
        )
        .then((result) => result.rows[0]);
}

// createUser
async function createUser({ first_name, last_name, email, password }) {
    const hashedPassword = await hashPassword(password);
    const result = await db.query(
        `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
        [first_name, last_name, email, hashedPassword]
    );
    return result.rows[0];
}
async function getUserByEmail(email) {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
        email,
    ]);
    return result.rows[0];
}

function getUserById(user_id) {
    return db
        .query(
            `
    SELECT first_name, last_name, email, age, city, url, signature
    FROM users
    FULL JOIN signatures ON users.id = signatures.user_id
    FULL JOIN user_profiles ON users.id = user_profiles.user_id
    WHERE users.id = $1
    `,
            [user_id]
        )
        .then((result) => result.rows[0]);
}
// login
async function login({ email, password }) {
    const foundUser = await getUserByEmail(email);

    if (!foundUser) {
        return null;
    }
    const match = await compare(password, foundUser.password_hash);

    if (!match) {
        return null;
    }
    return foundUser;
}
// createProfile
async function createProfile({ age, city, url, user_id }) {
    const result = await db.query(
        `
    INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
        [age, city, url, user_id]
    );
    return result.rows[0];
}
async function findCities(city) {
    const result = await db.query(
        `
            SELECT first_name, last_name, age, city, url 
            FROM users 
            INNER JOIN signatures ON users.id = signatures.user_id
            INNER JOIN user_profiles ON users.id = user_profiles.user_id
            WHERE LOWER(city) = LOWER($1)
            `,
        [city]
    );
    return result.rows;
}
module.exports = {
    getSignatures,
    newSignature,
    getSignatureById,
    createUser,
    login,
    createProfile,
    findCities,
    getUserById,
};
