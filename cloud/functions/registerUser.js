const { v4: uuidv4 } = require("uuid");

Parse.Cloud.define("register", async (req) => {
  const {
    name,
    email,
    passwordOne,
    passwordTwo,
    promoCode,
    termsAccepted,
    usageAccepted,
  } = req.params;

  if (passwordOne !== passwordTwo) {
    return {
      code: 5,
      message: "Passwords don't match. Try again.",
    };
  }

  let nameOfTheUser = name;

  if (!name) {
    nameOfTheUser = "Stranger";
  }

  let applyBonus = false;

  if (promoCode) {
    const promoQuery = new Parse.Query("Promos");
    promoQuery.equalTo("code", promoCode);
    const res = await promoQuery.first();

    if (!res) {
      return {
        code: 7,
        message: "Promo code expired or is invalid",
      };
    }

    const used = res.attributes.used;

    if (used) {
      return {
        code: 8,
        message: "This promo has already been used",
      };
    } else {
      res.set("used", true);
      await res.save(null, {useMasterKey: true});
      applyBonus = true;
    }
  }

  const user = new Parse.User();
  user.set("username", email);
  user.set("name", nameOfTheUser);
  user.set("email", email);
  user.set("password", passwordOne);
  user.set("passwordLength", passwordOne.length);
  user.set("customerId", uuidv4());
  user.set("customerPlan", 0);

  if (applyBonus) {
    user.set("prepQuotaImg", 40);
    user.set("prepQuotaUsd", 10);
  }

  try {
    if (!termsAccepted) {
      return {
        code: 1,
        message: "You must agree with the terms of service to register.",
      };
    }
    if (!usageAccepted) {
      return {
        code: 6,
        message: "You must agree with the terms of usage to register.",
      };
    }

    await user.signUp(null, { useMasterKey: true });

    return { code: 0, user };
  } catch (err) {
    if (err.code === 202 || err.code === 203) {
      return { code: 2, message: "An account already exists for this email." };
    }
    if (err.code === 201) {
      return { code: 3, message: "Password is missing. Provide a password." };
    }
    if (err.code === 200) {
      return { code: 4, message: "Email is missing. Provide your email." };
    }
  }
});
