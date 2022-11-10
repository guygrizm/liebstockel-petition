const { createUser, login } = require("./db");

createUser({
    email: "secondtry@gmail.com",
    first_name: "first",
    last_name: "last",
    password: "second",
}).then((newUser) => {
    console.log("newUser", newUser);
});
