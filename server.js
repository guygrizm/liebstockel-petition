const express = require("express");
const { getSignatureById, getSignatures, newSignature } = require("./db");
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

/* app.get("/petition", (request, response) => {
    getSignatures().then((signatures) => {
        response.render("petition", {
            title: "Sign this empty but awesome petition!",
            signatures,
        });
    });
}); */

app.get("/petition", (request, response) => {
    const signature_id = request.session.signatures_id;
    if (signature_id) {
        response.redirect("petition/thanks");
        return;
    }
    response.render("petition");
});

/* app.post("/petition", async (request, response) => {
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
}); */
app.post("/petition", async (request, response) => {
    try {
        const newSigner = await newSignature(request.body);
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

/* app.get("/petition/thanks", async (request, response) => {
    const signers = await getSignatures();
    response.render("thanks", { signers });
}); */

app.get("/petition/thanks", async (request, response) => {
    const signature_id = request.session.signatures_id;

    if (!request.session.signatures_id) {
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
