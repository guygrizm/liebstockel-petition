const express = require("express");
const {
    getSignatureById,
    getSignatures,
    newSignature,
    login,
    createUser,
    createProfile,
    findCities,
    getUserById,
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

app.get("/login", (request, response) => {
    if (request.session.user_id) {
        response.redirect("/petition");
        return;
    }
    response.render("login");
});

app.post("/login", async (request, response) => {
    try {
        const loggedUser = await login(request.body);

        request.session.user_id = loggedUser.id;
        response.redirect("/petition");
    } catch (error) {
        console.log("error login", error);
        response.render("/login", {
            error: "Something went wrong. Please try again.",
        });
    }
});

app.get("/register", (request, response) => {
    if (request.session.user_id) {
        response.redirect("/profile");
    } else {
        response.render("register");
    }
});

app.post("/register", async (request, response) => {
    try {
        const newUser = await createUser(request.body);
        request.session.user_id = newUser.id;
        response.redirect("/profile");
    } catch (error) {
        console.log("error", error);
    }
});

app.get("/profile", (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/register");
    } else {
        response.render("profile");
    }
});

app.post("/profile", async (request, response) => {
    try {
        const profile = await createProfile(
            request.body,
            request.session.user_id
        );
        request.session.user_id = profile.id;
        response.redirect("/petition");
    } catch (error) {
        console.log("error", error);
    }
});

app.get("/petition", async (request, response) => {
    try {
        const user_id = request.session.user_id;
        if (!user_id) {
            response.redirect("/register");
            return;
        }
        const signature_id = await getSignatureById(user_id);
        if (signature_id) {
            response.redirect("/petition/thanks");
            return;
        }
        response.render("petition");
    } catch (error) {
        console.log("error", error);
    }
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
    const signature_id = request.session.user_id;

    if (!request.session.user_id) {
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

app.get("/petition/signers/:city", async (request, response) => {
    const { city } = request.params;
    console.log(city);
    const foundCity = findCities(city);
    response.render("cityUser", { foundCity });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
