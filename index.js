const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const S3Adapter = require("@parse/s3-files-adapter");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { requestImages, requestEdit, requestVariation } = require("./openAi.js");
const { webhookHandler } = require("./webhooks");

const api = new ParseServer({
  /* General */
  databaseURI: process.env.MONGODB_URI,
  cloud: process.env.CLOUD_FUNCTIONS || __dirname + "/cloud/main.js",
  serverURL: process.env.SERVER_URL || "http://localhost:3001/parse",

  /* Security */
  allowClientClassCreation: process.env.CLIENT_CLASS_CREATION || false,
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY,

  /* Live Query */
  liveQuery: {
    classNames: ["TextToImage", "EditImage", "VariateImage"],
  },

  /* Email Verification */
  // verifyUserEmails: true,
  publicServerURL: process.env.SERVER_URL || "http://localhost:3001/parse",
  appName: process.env.APP_NAME || "Paintmuse",

  /* File Storage*/
  filesAdapter: new S3Adapter({
    bucket: process.env.S3_BUCKET,
    directAccess: true,
  }),
  fileUpload: { enableForPublic: true },

  /* Email Adapter */
  emailAdapter: {
    module: "parse-smtp-template",
    options: {
      port: process.env.AWS_SMTP_PORT,
      host: process.env.AWS_SMTP_HOST,
      user: process.env.AWS_SMTP_USERNAME,
      password: process.env.AWS_SMTP_PASSWORD,
      fromAddress: process.env.EMAIL_FROM_ADDRESS,

      multiTemplate: true,
      confirmTemplatePath: "./templates/verification_email.html",
      passwordTemplatePath: "./templates/password_reset_email.html",
      confirmOptions: {
        subject: "Paintmuse - Confirm email",
        body: "Click the link below to confirm your email",
        btn: "Confirm email",
      },
      passwordOptions: {
        subject: "Paintmuse - Password reset",
        body: "Click the link below to reset your password:",
        btn: "Reset password",
      },
    },
  },
});

const corsOptions = {
  origin: "*",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Origin",
    "Accept",
  ],
};

const app = express();
const httpServer = require("http").createServer(app);
const mountPath = process.env.PARSE_MOUNT || "/parse";
app.use(bodyParser.json());
app.use(mountPath, api);

app.options("*", cors());

app.post("/requestImages", cors(), async (req, res) => {
  try {
    const requestData = {
      prompt: req.body.prompt,
      count: req.body.count,
      style: req.body.style,
      medium: req.body.medium,
      customerId: req.body.customerId,
      query: req.body.query,
    };
    const reply = await requestImages(requestData);
    return res.json(reply.data);
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

app.post("/requestEdit", cors(), async (req, res) => {
  try {
    const data = {
      prompt: req.body.prompt,
      count: req.body.count,
      original: req.body.original,
      mask: req.body.mask,
      customerId: req.body.customerId,
    };
    const reply = await requestEdit(data);
    return res.json(reply.data);
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

app.post("/requestVariation", cors(), async (req, res) => {
  try {
    const reply = await requestVariation({
      original: req.body.original,
      count: req.body.count,
      customerId: req.body.customerId,
    });
    return res.json(reply.data);
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

app.post("/webhook", cors(), (req, res) => {
  const event = req.body;
  console.log("reached here 136");

  const signature = request.headers["stripe-signature"];

  try {
    console.log("reached here 141");
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("reached here 148", event);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return response.sendStatus(400);
  }

  webhookHandler(event);
  res.json({ received: true });
});

app.post("/checkout_sessions", cors(), async (req, res) => {
  if (req.method === "POST") {
    console.log("reached here 156");
    try {
      console.log("reached here 158", {
        mode: req.body.mode,
        payment_method_types: ["card"],
        line_items: req.body.items,
        success_url: `${req.headers.origin}/postpayment?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
        customer_email: req.body.email,
      });
      const session = await stripe.checkout.sessions.create({
        mode: req.body.mode,
        payment_method_types: ["card"],
        line_items: req.body.items,
        success_url: `${req.headers.origin}/postpayment?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/pricing`,
        customer_email: req.body.email,
      });

      console.log("reached here 168", session);
      res.status(200).json(session);
    } catch (err) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
});

app.post("/checkout_sessions/:id", cors(), async (req, res) => {
  const id = req.query.id;
  console.log("reached here 181");
  try {
    if (!id.startsWith("cs_")) {
      throw Error("Incorrect CheckoutSession ID.");
    }
    const checkout_session = await stripe.checkout.sessions.retrieve(id);
    console.log("reached here 187", checkout_session);
    res.status(200).json(checkout_session);
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
});

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});

ParseServer.createLiveQueryServer(httpServer);
