const { createUser, login } = require("./db");

createUser({
    email: "bobd@gmail.com",
    first_name: "Bob",
    last_name: "Dylan",
    password: "bob",
}).then((newUser) => {
    console.log("newUser", newUser);
});
