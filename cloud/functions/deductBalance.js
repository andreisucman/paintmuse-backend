Parse.Cloud.define("deductBalance", async (req, res) => {
  const { customerId, count } = req.params;

  const User = Parse.Object.extend(Parse.User);
  const query = new Parse.Query(User);
  query.equalTo("customerId", customerId);
  const result = await query.first({ useMasterKey: true });

  const currenPrepQuotaUsd = result.attributes.prepQuotaUsd;
  const currentPrepQuotaImg = result.attributes.prepQuotaImg;
  const currentSubQuotaImg = result.attributes.subQuotaImg;
  const plan = result.attributes.customerPlan;

  if (plan === 0) {
    const requestFee = count * process.env.PREPAID_PLAN_IMAGE_PRICE;
    const newPrepQuotaUsd = currenPrepQuotaUsd - requestFee;
    const newPrepQuotaImg = currentPrepQuotaImg - count;
    result.set("prepQuotaUsd", newPrepQuotaUsd);
    result.set("prepQuotaImg", newPrepQuotaImg);
    await result.save(null, { useMasterKey: true });
  } else if (plan === 1) {
    if (currentSubQuotaImg > 0) {
      const newSubQuotaImg = currentSubQuotaImg - count;
      result.set("subQuotaImg", newSubQuotaImg);
      await result.save(null, { useMasterKey: true });
    } else {
      const requestFee = count * process.env.MONTHLY_PLAN_EXTRA_PRICE;
      const newPrepQuotaUsd = currenPrepQuotaUsd - requestFee;
      const newPrepQuotaImg = currentPrepQuotaImg - count;
      result.set("prepQuotaUsd", newPrepQuotaUsd);
      result.set("prepQuotaImg", newPrepQuotaImg);
      await result.save(null, { useMasterKey: true });
    }
  } else {
    if (currentSubQuotaImg > 0) {
      const newSubQuotaImg = currentSubQuotaImg - count;
      result.set("subQuotaImg", newSubQuotaImg);
      await result.save(null, { useMasterKey: true });
    } else {
      const requestFee = count * process.env.ANNUAL_PLAN_EXTRA_PRICE;
      const newPrepQuotaUsd = currenPrepQuotaUsd - requestFee;
      const newPrepQuotaImg = currentPrepQuotaImg - count;
      result.set("prepQuotaUsd", newPrepQuotaUsd);
      result.set("prepQuotaImg", newPrepQuotaImg);
      await result.save(null, { useMasterKey: true });
    }
  }
});
