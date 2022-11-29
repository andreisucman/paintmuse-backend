const Parse = require("parse/node");
require("dotenv").config();

async function updateQuota({ mode, amount, email, customer }) {
  Parse.initialize(process.env.APP_ID, undefined, process.env.MASTER_KEY);

  const User = Parse.Object.extend(Parse.User);
  const query = new Parse.Query(User);
  query.equalTo("email", email);
  const result = await query.first({ useMasterKey: true });
  const stripeCustId = result.attributes.stripeCustId;

  if (mode === "payment") {
    const plan = result.attributes.customerPlan;

    const currentPrepUsdQuota = result.attributes.prepQuotaUsd;
    const currentPrepImgQuota = result.attributes.prepQuotaImg;
    const newPrepUsdQuota = currentPrepUsdQuota + amount / 100;

    let newPrepImgQuota;

    if (plan === 0) {
      newPrepImgQuota =
        currentPrepImgQuota +
        Math.round(amount / 100 / process.env.PREPAID_PLAN_IMAGE_PRICE);
    } else if (plan === 1) {
      newPrepImgQuota =
        currentPrepImgQuota +
        Math.round(amount / 100 / process.env.MONTHLY_PLAN_EXTRA_PRICE);
    } else {
      newPrepImgQuota =
        currentPrepImgQuota +
        Math.round(amount / 100 / process.env.ANNUAL_PLAN_EXTRA_PRICE);
    }

    result.set("prepQuotaUsd", newPrepUsdQuota);
    result.set("prepQuotaImg", newPrepImgQuota);

    if (!stripeCustId) {
      result.set("stripeCustId", customer);
    }

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

      if (!stripeCustId) {
        result.set("stripeCustId", customer);
      }

      await result.save(null, { useMasterKey: true });
      return;
    } else {
      if (result.attributes.prepQuotaUsd > 0) {
        result.set(
          "prepQuotaImg",
          Math.round(
            result.attributes.prepQuotaUsd / process.env.ANNUAL_PLAN_EXTRA_PRICE
          )
        );
      }
      const currentSubQuota = result.attributes.subQuotaImg;
      const newExpirationDate = new Date(
        (currentExpirationDate / 1000 + 28927183) * 1000
      );
      result.set("renewsOn", newExpirationDate);
      result.set("customerPlan", 2);
      result.set("subQuotaImg", currentSubQuota + 2160);

      if (!stripeCustId) {
        result.set("stripeCustId", customer);
      }

      await result.save(null, { useMasterKey: true });
      return;
    }
  }
}

module.exports = { updateQuota };
