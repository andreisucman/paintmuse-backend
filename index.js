const express = require("express");
const ParseServer = require("parse-server").ParseServer;
const S3Adapter = require("@parse/s3-files-adapter");
const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
require("dotenv").config();

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

// app.post("/updateQuota", cors(), async (req, res) => {
//   try {
//     const request = {
//       mode: req.body.mode,
//       amount: req.body.amount,
//       email: req.body.email,
//     };
//     console.log(request);
//     await updateQuota(request);
//     return res.status(200);
//   } catch (err) {
//     console.log(err);
//     res.status(404).send(err);
//   }
// });

app.post("/webhook", express.json({ type: "application/json" }), (req, res) => {
  const event = req.body;

  const signature = request.headers["stripe-signature"];

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return response.sendStatus(400);
  }

  webhookHandler(event);
  res.json({ received: true });
});

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});

ParseServer.createLiveQueryServer(httpServer);
