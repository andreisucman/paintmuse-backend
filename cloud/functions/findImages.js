const { getTags } = require("../../helpers/getTags");

Parse.Cloud.define("findImages", async (req) => {
  const { searchQuery, limit, page, style, medium, customerId, fields } = req.params;
  const query = new Parse.Query("TextToImage");

  let words;
  let wordsLength;
  let result;
  let response;
  let matching = [];
  let matchingLength;

  if (searchQuery) {
    words = getTags(searchQuery);
    wordsLength = words.length;
  }

  query.descending("createdAt");

  if (customerId) {
    query.equalTo("customerId", customerId);
  }

  query.select(fields);

  if (searchQuery && searchQuery !== "Describe the image you're looking for") {
    if (style && style !== "Select style") {
      if (medium && medium !== "Select medium") {
        for (let i = wordsLength - 1; i >= 0; i--) {
          query.fullText("tags", String(words[i]));
          query.equalTo("style", style);
          query.equalTo("medium", medium);
          result = await query.find({ useMasterKey: true });

          if (result.length > 0) {
            matching.push(...result);
          }
        }
        matchingLength = matching.length;
      } else {
        for (let i = wordsLength - 1; i >= 0; i--) {
          query.fullText("tags", String(words[i]));
          query.equalTo("style", style);
          result = await query.find({ useMasterKey: true });

          if (result.length > 0) {
            matching.push(...result);
          }
        }
        matchingLength = matching.length;
      }
    } else {
      if (medium && medium !== "Select medium") {
        for (let i = wordsLength - 1; i >= 0; i--) {
          query.fullText("tags", String(words[i]));
          query.equalTo("medium", medium);
          result = await query.find({ useMasterKey: true });

          if (result.length > 0) {
            matching.push(...result);
          }
        }
        matchingLength = matching.length;
      } else {
        for (let i = wordsLength - 1; i >= 0; i--) {
          query.fullText("tags", String(words[i]));
          result = await query.find({ useMasterKey: true });

          if (result.length > 0) {
            matching.push(...result);
          }
        }
        matchingLength = matching.length;
      }
    }
  } else {
    if (style && style !== "Select style") {
      if (medium && medium !== "Select medium") {
        query.equalTo("style", style);
        query.equalTo("medium", medium);
        matching = await query.find({ useMasterKey: true });
        matchingLength = matching.length;
      } else {
        query.equalTo("style", style);
        matching = await query.find({ useMasterKey: true });
        matchingLength = matching.length;
      }
    } else {
      if (medium && medium !== "Select medium") {
        query.equalTo("medium", medium);
        matching = await query.find({ useMasterKey: true });
        matchingLength = matching.length;
      } else {
        matching = await query.find({ useMasterKey: true });
        matchingLength = matching.length;
      }
    }
  }

  if (page * limit <= matchingLength) {
    response = matching.slice(
      matchingLength - page * limit,
      matchingLength - (page - 1) * limit
    );
  } else if (page * limit - matchingLength <= limit) {
    response = matching.slice(0, matchingLength - (page - 1) * limit);
  } else {
    response = [];
  }

  return response.map((element) => element.attributes);
});
