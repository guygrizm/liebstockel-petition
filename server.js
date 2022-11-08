const express = require("express");
const {
    /*  getUsers,
    getUserById,
    newUser,
    editUser, */
    getSignatures,
    newSignature,
} = require("./db");
const { engine } = require("express-handlebars");
const path = require("path");
const { request } = require("http");
const { response } = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.get("/petition", (request, response) => {
    // get the users from the db
    // then() render the appropriate hbs template and pass the users to it
    getSignatures().then((signatures) => {
        response.render("petition", {
            title: "Sign this empty but awesome petition!",
            signatures,
        });
    });
});

app.post("/petition", async (request, response) => {
    console.log("POST /petition", request.body);
    try {
        await newSignature(
            request.body.first_name,
            request.body.last_name,
            request.body.signature
        );

        response.redirect("/petition/thanks");
    } catch (error) {
        console.log("error", error);
        response.render("petition", {
            error: "Something went wrong. Please try again!",
        });
    }
});

app.get("/petition/thanks", (request, response) => {
    // get the users from the db
    // then() render the appropriate hbs template and pass the users to it
    getSignatures().then((signatures) => {
        response.render("thanks", {
            title: "Thank you for signing our petition!",
            signatures,
        });
    });
});
app.get("/petition/signers", (request, response) => {
    getSignatures().then((signer) => response.render("signers", { signer }));
    // console.log("response", res);
});
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
