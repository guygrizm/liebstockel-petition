const { createUser, login } = require("./db");

createUser({
    email: "six@gmail.com",
    first_name: "first",
    last_name: "last",
    password: "six",
}).then((newUser) => {
    console.log("newUser", newUser);
});
