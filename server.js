const express = require("express");
const {
    getSignatureById,
    getSignatures,
    newSignature,
    login,
    createUser,
} = require("./db");
const { engine } = require("express-handlebars");
const path = require("path");
const { request } = require("http");
const { response } = require("express");
const app = express();
const cookieSession = require("cookie-session");
const { SESSION_SECRET } = require("./secrets.json");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.get("/register", (request, response) => {
    response.render("register");
});

app.post("/register", async (request, response) => {
    try {
        const newUser = await createUser(request.body);
        request.session.user_id = newUser.id;
        response.redirect("/petition");
    } catch (error) {
        console.log("error register", error);
    }
});

app.get("/login", (request, response) => {
    response.render("login");
});

app.post("/login", async (request, response) => {
    try {
        const loggedUser = await login(request.body);
        if (!loggedUser) {
            return;
        }
        request.session.users_id = loggedUser.id;
        response.redirect("/petition");
    } catch (error) {
        console.log("error login", error);
    }
});

app.get("/petition", (request, response) => {
    const signature_id = request.session.signatures_id;
    if (signature_id) {
        response.redirect("/petition/thanks");
        return;
    }
    response.render("petition");
});

app.post("/petition", async (request, response) => {
    try {
        const newSigner = await newSignature(request.body, request.session);
        request.session.signatures_id = newSigner.id;
        console.log("SESSION", request.session);
        response.redirect("/petition/thanks");
    } catch (error) {
        console.log("error", error);
        response.render("petition", {
            error: "Something went wrong. Please try again!",
        });
    }
});

app.get("/petition/thanks", async (request, response) => {
    const signature_id = request.session.users_id;

    if (!request.session.users_id) {
        response.redirect("/petition");
    }
    try {
        const signer = await getSignatureById(signature_id);
        console.log(signer);
        const signers = await getSignatures();
        console.log(signers);

        response.render("thanks", { signers, signer });
    } catch (error) {
        console.log("ERROR", error);
    }
});

app.get("/petition/signers", async (request, response) => {
    const signers = await getSignatures();
    response.render("signers", { signers });
});
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
