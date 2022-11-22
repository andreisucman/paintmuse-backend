function getTags(prompt) {
  return prompt
    .toLowerCase()
    .split(" ")
    .filter(
      (word) =>
        word !== "in" &&
        word !== "the" &&
        word !== "a" &&
        word !== "and" &&
        word !== "with" &&
        word !== "or" &&
        word !== "on" &&
        word !== "over" &&
        word !== "of" &&
        word !== "picture" &&
        word !== "is" &&
        word !== "style" &&
        word !== "at" &&
        word !== "under" &&
        word !== "like" &&
        word !== "similar"
    );
}

module.exports = { getTags };