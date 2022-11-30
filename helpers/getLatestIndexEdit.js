const Parse = require("parse/node");

async function getLatestIndexEdit() {
  const q = new Parse.Query("EditImage");
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

module.exports = { getLatestIndexEdit };
