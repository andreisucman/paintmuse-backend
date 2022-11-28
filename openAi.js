const fs = require("fs");
const Parse = require("parse/node");
const { Configuration, OpenAIApi } = require("openai");
const { resizeAndSave } = require("./helpers/resizeAndSave");
const { getLatestIndexTTI } = require("./helpers/getLatestIndexTTI");
const { getLatestIndexEdit } = require("./helpers/getLatestIndexEdit");
const { getLatestIndexVariate } = require("./helpers/getLatestIndexVariate");
const { checkIfPrivate } = require("./helpers/checkIfPrivate");
const request = require("request").defaults({ encoding: null });
require("dotenv").config();

async function requestImages({
  query,
  prompt,
  count,
  style,
  medium,
  customerId,
}) {
  // Parse.initialize(process.env.APP_ID, undefined, process.env.MASTER_KEY);
  // Parse.serverURL = process.env.SERVER_URL;

  // const allow = await Parse.Cloud.run("validateUser", { user });
  // if (!allow) return { allow: false, message: "Please top up your balance or subscribe to a plan."};

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createImage({
      prompt,
      n: count,
      size: "1024x1024",
      user: customerId,
    });

    const request = require("request").defaults({ encoding: null });
    const latestIndex = await getLatestIndexTTI();
    const isPrivate = await checkIfPrivate(customerId);

    for (let i = 0; i < response.data.data.length; i++) {
      request.get(response.data.data[i].url, async (err, res, body) => {
        const url = await resizeAndSave({
          imageData: body,
          customerId,
          query,
          style,
          medium,
          tableName: "TextToImage",
          index: latestIndex + 1,
          isPrivate,
        });

        return url;
      });
    }

    return 1;
  } catch (err) {
    console.log(err);
  }
}

async function requestEdit({ prompt, count, original, mask, customerId }) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createImageEdit({
      image: request.get(original, async (body) => body),
      mask: request.get(mask, async (body) => body),
      prompt,
      n: count,
      size: "1024x1024",
      user: customerId,
    });

    const latestIndex = await getLatestIndexEdit();
    const isPrivate = await checkIfPrivate(customerId);

    for (let i = 0; i < response.data.data.length; i++) {
      request.get(response.data.data[i].url, async (err, res, body) => {
        const url = await resizeAndSave({
          imageData: body,
          customerId,
          query: prompt,
          original,
          mask,
          tableName: "EditImage",
          index: latestIndex + 1,
          isPrivate,
        });

        return url;
      });
    }

    return 1;
  } catch (err) {
    console.log(err);
  }
}

async function requestVariation({ original, count, customerId }) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createImageVariation({
      image: request.get(original, async (err, res, body) => body),
      n: count,
      size: "1024x1024",
      user: customerId,
    });

    const latestIndex = await getLatestIndexVariate();
    const isPrivate = await checkIfPrivate(customerId);

    for (let i = 0; i < response.data.data.length; i++) {
      request.get(response.data.data[i].url, async (err, res, body) => {
        const url = await resizeAndSave({
          imageData: body,
          customerId,
          original,
          tableName: "VariateImage",
          index: latestIndex + 1,
          isPrivate,
        });

        return url;
      });
    }

    return 1;
  } catch (err) {
    console.log(err);
  }
}

module.exports = { requestImages, requestEdit, requestVariation };
