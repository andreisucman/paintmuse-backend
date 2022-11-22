const { getTags } = require("./getTags");
const { v4: uuidv4 } = require('uuid');

async function saveImagesToDB({
  imageData,
  customerId,
  query,
  style,
  medium,
  original,
  mask,
  tableName,
  index,
  isPrivate
}) {
  let tags;

  if (query) {
    tags = getTags(query);
  }

  const parseFile = new Parse.File("picture", imageData);
  await parseFile.save(null, { useMasterKey: true });

  const Table = Parse.Object.extend(tableName);
  const newInstance = new Table();

  newInstance.set("url", parseFile.url());
  newInstance.set("customerId", customerId);
  newInstance.set("isPrivate", isPrivate);
  newInstance.set("index", index);

  const imageId = uuidv4();
  newInstance.set("imageId", imageId);

  if (query) {
    newInstance.set("tags", tags);
    newInstance.set("query", query);
  }
  if (original) {
    newInstance.set("originalUrl", original);
  }
  if (mask) {
    newInstance.set("maskUrl", mask);
  }
  if (style) {
    newInstance.set("style", style);
  }
  if (medium) {
    newInstance.set("medium", medium);
  }

  await newInstance.save(null, { useMasterKey: true });
  return parseFile.url();
}

module.exports = { saveImagesToDB };
