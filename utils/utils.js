
const { Configuration, OpenAIApi } = require("openai");

async function validopenai(openaikey)
{
try{
const configuration = new Configuration ({
  apiKey: openaikey
});

const openai = new OpenAIApi (configuration);
const response = await openai.listModels ();
return true ;
}
catch(error)
{
  return false;
}
}

function gwokenCorrect(body, gwoken) {
    return true;
  }

  // A function that generates an array of unique identifiers
function generateIds(a) {
  // Create an empty array to store the ids
  let ids = [];
  // Loop from 0 to a-1
  for (let i = 0; i < a; i++) {
    // Generate a random 32-bit integer using Math.random and toString(16)
    let id = Math.floor(Math.random() * Math.pow(2, 32)).toString(16);
    // Check if the id is already in the array
    while (ids.includes(id)) {
      // If yes, generate a new id
      id = Math.floor(Math.random() * Math.pow(2, 32)).toString(16);
    }
    // Push the id to the array
    ids.push(id);
  }
  // Return the array of ids
  return ids;
}
  
  
  module.exports.gwokenCorrect = gwokenCorrect;
  module.exports.generateIds = generateIds;
  module.exports.validopenai = validopenai;