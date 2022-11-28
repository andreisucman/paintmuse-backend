const { v4: uuidv4 } = require("uuid");

Parse.Cloud.define("register", async (req) => {
  const { name, email, passwordOne, passwordTwo, termsAccepted } = req.params;

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

  const user = new Parse.User();
  user.set("username", email);
  user.set("name", nameOfTheUser);
  user.set("email", email);
  user.set("password", passwordOne);
  user.set("passwordLength", passwordOne.length);
  user.set("customerId", uuidv4());
  user.set("customerPlan", 0);

  try {
    if (!termsAccepted) {
      return {
        code: 1,
        message: "You must agree with the terms of service to register.",
      };
    }
    await user.signUp();
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
