const Parse = require("parse/node");

async function getLatestIndexTTI() {
  const q = new Parse.Query("TextToImage");
  q.descending("createdAt");
  const qResult = await q.first({ useMasterKey: true });
  let index;

  if (qResult) {  
    index = qResult.attributes.index;
  }
  
  if (index) {
    return index;
  } else {
    return 0;
  }
}

module.exports = { getLatestIndexTTI };
