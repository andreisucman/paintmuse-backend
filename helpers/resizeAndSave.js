const sharp = require("sharp");
const { saveImagesToDB } = require("./saveImagesToDB");

async function resizeAndSave({
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
  try {
    const { data, info } = await sharp(imageData)
      .toFormat("jpeg", { mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    const url = await saveImagesToDB({
      imageData: { base64: data.toString("base64") },
      customerId,
      query,
      style,
      medium,
      original,
      mask,
      tableName,
      index,
      isPrivate
    });

    return url;
    
  } catch (err) {
    console.log(err);
  }
}

module.exports = { resizeAndSave };
