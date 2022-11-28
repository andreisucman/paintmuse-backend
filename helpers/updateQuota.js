const Parse = require("parse/node");
require("dotenv").config();

async function updateQuota({ mode, amount, customerId }) {
  const query = new Parse.Query(Parse.User);
  query.equalTo("customerId", customerId);
  const result = await query.first();

  if (mode === "payment") {
    const currentUsdQuota = result.attributes.quotaUsd;
    const currentImgQuota = result.attributes.quotaImg;
    const newUsdQuota = currentUsdQuota + amount / 100;
    const newImgQuota =
      currentImgQuota +
      Math.round(
        amount / 100 / process.env.PREPAID_PLAN_IMAGE_PRICE
      );
    result.set("quotaUsd", newUsdQuota);
    result.set("quotaImg", newImgQuota);
    await result.save();
    return;
  }

  if (mode === "subscription") {
    const currentExpirationDate = result.attributes.renewsOn;

    if (amount < 100) {
      const newExpirationDate = new Date(
        Math.round(currentExpirationDate / 1000) + 2629743
      );
      result.set("renewsOn", newExpirationDate);
      result.set("customerPlan", 1);
      result.set("quotaImg", 90);
      await result.save();
      return;

    } else {
      const newExpirationDate = new Date(
        Math.round(currentExpirationDate / 1000) + 31556926
      );
      result.set("renewsOn", newExpirationDate);
      result.set("customerPlan", 2);
      result.set("quotaImg", 2160);
      await result.save();
      return;
    }
  }
}

module.exports = { updateQuota };
