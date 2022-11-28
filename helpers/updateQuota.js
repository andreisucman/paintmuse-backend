const Parse = require("parse/node");
require("dotenv").config();

async function updateQuota({ mode, amount, email }) {
  Parse.initialize(process.env.APP_ID, undefined, process.env.MASTER_KEY);

  const query = new Parse.Query(Parse.User);
  query.equalTo("email", email);
  const result = await query.first({ useMasterKey: true });

  if (mode === "payment") {
    const currentUsdQuota = result.attributes.quotaUsd;
    const currentImgQuota = result.attributes.quotaImg;
    const newUsdQuota = currentUsdQuota + amount / 100;
    const newImgQuota =
      currentImgQuota +
      Math.round(amount / 100 / process.env.PREPAID_PLAN_IMAGE_PRICE);
    result.set("quotaUsd", newUsdQuota);
    result.set("quotaImg", newImgQuota);
    await result.save(null, { useMasterKey: true });
    return;
  }

  if (mode === "subscription") {
    const currentExpirationDate = result.attributes.renewsOn;

    if (amount / 100 < 100) {
      const newExpirationDate = new Date((currentExpirationDate / 1000 + 2629743) * 1000);
      result.set("renewsOn", newExpirationDate);
      result.set("customerPlan", 1);
      result.set("quotaImg", 90);
      await result.save(null, { useMasterKey: true });
      return;
    } else {
      const newExpirationDate = new Date((currentExpirationDate / 1000 + 31556926) * 1000);
      result.set("renewsOn", newExpirationDate);
      result.set("customerPlan", 2);
      result.set("quotaImg", 2160);
      await result.save(null, { useMasterKey: true });
      return;
    }
  }
}

module.exports = { updateQuota };
