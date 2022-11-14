DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles;


CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature VARCHAR NOT NULL CHECK(signature != ''),
    user_id INTEGER
);



CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  age INT,
  city VARCHAR,
  url VARCHAR,
  user_id INT NOT NULL UNIQUE REFERENCES users(id)
);
 

        