const express = require("express");
const {
    getSignatures,
    newSignature,
    getSignatureById,
    createUser,
    login,
    createProfile,
    findCities,
    getUserById,
    editUser,
    editProfile,
    deleteSignature,
    deleteUser,
    deleteProfile,
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

app.get("/profile/edit", async (request, response) => {
    const { user_id } = request.session;
    const user = await getUserById(user_id);
    response.render("edit", { user });
});

app.post("/profile/edit", async (request, response) => {
    try {
        const { user_id } = request.session;
        await editUser({ ...request.body, user_id });
        response.redirect("/petition/thanks");
    } catch (error) {
        console.log("error edit", error);
    }
});

app.post("/profile/delete", async (request, response) => {
    try {
        const { user_id } = request.session;
        await deleteUser(user_id);
        await deleteProfile(user_id);
        await deleteSignature(user_id);
        request.session = null;
        response.redirect("/register");
    } catch (error) {
        console.log("error delete", error);
    }
});

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
        const signature_id = await getSignatureById(loggedUser.id);
        const signId = signature_id;
        request.session.signatures_id = signId;
        response.redirect("/petition");
        return;
    } catch (error) {
        console.log("error login", error);
        const { email, password } = request.body;
        response.render("login", {
            error: "Something went wrong. Please try again.",
            email,
            password,
        });
    }
});

app.get("/petition", async (request, response) => {
    try {
        const user_id = request.session.user_id;
        const sig_id = request.session.signatures_id;

        if (!user_id) {
            response.redirect("/register");
            return;
        }
        if (sig_id) {
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
        /* console.log("SESSION", request.session); */
        response.redirect("/petition/thanks");
    } catch (error) {
        console.log("error", error);
        response.render("petition", {
            error: "Something went wrong. Please try again!",
        });
    }
});

app.get("/petition/thanks", async (request, response) => {
    try {
        const { user_id } = request.session;
        const { signatures_id } = request.session;
        if (!user_id) {
            response.redirect("/register");
            return;
        }
        if (!signatures_id) {
            response.redirect("/petition");
            return;
        }
        const signature = await getUserById(user_id);
        const signers = await getSignatures();
        response.render("thanks", { signers, signature });
    } catch (error) {
        console.log("error", error);
    }
});

app.post("/petition/thanks", async (request, response) => {
    try {
        const { user_id } = request.session;
        await deleteSignature(user_id);
        request.session.signatures_id = null;
        response.redirect("/petition");
    } catch (error) {
        console.log("error thanks", error);
    }
});

app.get("/petition/signers", async (request, response) => {
    const signers = await getSignatures();
    response.render("signers", { signers });
});

app.get("/petition/signers/:city", async (request, response) => {
    const { city } = request.params;

    const foundCity = await findCities(city);
    response.render("cityUser", { city: city, foundCity });
});

app.get("/logout", (request, response) => {
    (request.session = null), response.redirect("/register");
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
