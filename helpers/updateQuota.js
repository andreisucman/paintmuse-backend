const Parse = require("parse/node");
require("dotenv").config();

async function updateQuota({ mode, amount, email }) {
  Parse.initialize(process.env.APP_ID, undefined, process.env.MASTER_KEY);

  const User = Parse.Object.extend(Parse.User);
  const query = new Parse.Query(User);
  query.equalTo("email", email);
  const result = await query.first({ useMasterKey: true });

  if (mode === "payment") {
    const currentPrepUsdQuota = result.attributes.prepQuotaUsd;
    const currentPrepImgQuota = result.attributes.prepQuotaImg;
    const newPrepUsdQuota = currentPrepUsdQuota + amount / 100;
    const newPrepImgQuota =
      currentPrepImgQuota +
      Math.round(amount / 100 / process.env.PREPAID_PLAN_IMAGE_PRICE);
    result.set("prepQuotaUsd", newPrepUsdQuota);
    result.set("prepQuotaImg", newPrepImgQuota);
    await result.save(null, { useMasterKey: true });
    return;
  }

  if (mode === "subscription") {
    const currentExpirationDate = result.attributes.renewsOn || new Date();

    if (amount / 100 < 100) {
      const newExpirationDate = new Date(
        (currentExpirationDate / 1000 + 2629743) * 1000
      );
      result.set("renewsOn", newExpirationDate);
      result.set("customerPlan", 1);
      result.set("subQuotaImg", 90);
      await result.save(null, { useMasterKey: true });
      return;

    } else {

      const newExpirationDate = new Date(
        (currentExpirationDate / 1000 + 28927183) * 1000
      );
      result.set("renewsOn", newExpirationDate);
      result.set("customerPlan", 2);
      result.set("subQuotaImg", 2160);
      await result.save(null, { useMasterKey: true });
      return;
    }
  }
}

module.exports = { updateQuota };
