const Client = require("../models/Client");
const crypto = require('crypto');

// Import the elliptic module using pm


const forge = require('node-forge');

// Define a function to perform end-to-end decryption of a body
function endToEndDecrypt(body) {

// Get private key of backend

const backendPrivateKey = process.env.PRIVATE_KEY;

// console.log("PivateKey:");
//console.log(backendPrivateKey);

console.log("RECEIVED Encrypted ekey");
console.log(body.ekey);
console.log("RECEIVED Encrypted message");
console.log(body.message);

// create a private key forge object

const privateKey = forge.pki.privateKeyFromPem(backendPrivateKey);

var ekeydecode64 = forge.util.decode64(body.ekey)

// We will first decrypt the key that was used to encrypt the message

const decryptedekey = privateKey.decrypt(ekeydecode64, 'RSA-OAEP');

console.log("Dycrypted ekey:");
console.log(decryptedekey);

// now we will decrypt the m

try {
  const jsonObject = JSON.parse(decryptedMessage);
  return (
  {
    result: true,
    body: {
      ...jsonObject
    }
  })
  
} 
catch (error) {
  return (
    {
      result: false
    })
}
 
console.log(jsonObject);

  // Return an object with the result and the decrypted JSON

    
  };







function CalculateSignature(token,parameters)
{
    // calculate the hash value of the token
    
    var ApiTokenHashvalue = crypto.MD5(token).toString();
    
    // order parameters alfabetically
    var SortedParams = sortObjByReverseKey(parameters);
    
    // Concatenate: add '&' between key and value pair and replace : for = 
    var MyString = '' ;
    for (const [key, value] of Object.entries(SortedParams)) {
        MyString += (`${key}=${value}&`);}

    //  add hash value of token at the and of the string
    MyString += ApiTokenHashvalue ;

    // create the verifySign

    const MySignature = crypto.MD5(MyString).toString();
    
    // return MySignature;

    
// sort object alphabetically by reverse key
// first it reverses the keys of the objects. i.e. {color: "blue"} becomes {roloc: "blue"} 
// then it sorts alphabetically

function sortObjByReverseKey(obj) {
    return Object.keys(obj).sort(function (a, b) {
      return a.split("").reverse().join("").localeCompare(b.split("").reverse().join(""));
    }).reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
  }

}

async function gwokenCorrect(body) {

  // get a body without the gwoken field

  mycleanedbody = removeProperty("gwoken", body)
  
  if (!body.gwoken)
  {
    return false
  }
  // console.log("API signature:");
  // console.log(body.gwoken)
  const client = await Client.findOne({ clientNr: body.clientNr });
  const backendsignature = CalculateSignature(client.clientToken,mycleanedbody);
  // console.log("Backend signature:");
  // console.log(backendsignature);
  return (body.gwoken==backendsignature);
}

function removeProperty(propertyName, object) {
  // create a new object to store the result
  let result = {};
  // loop through the keys of the original object
  for (let key in object) {
    // if the key is not equal to the property name to remove
    if (key !== propertyName) {
      // copy the key-value pair to the result object
      result[key] = object[key];
    }
  }
  // return the result object
  return result;
}


async function getDecodedBody(apiReq) {
  var endtoendPass = false;
  var gwokenPass = false;



    if (apiReq.body.ekey) // API is sending encryption
    {
      // get the body and result of the decription
      const decryption = endToEndDecrypt(apiReq.body);
      endtoendPass = decryption.result
      if (endtoendPass) // body was succesfully decrypted
      {   if (client.gwoken)
          {
          gwokenPass = await gwokenCorrect(decryption.body); 
          const myreq ={
            endtoendPass: true,
            gwokenPass: gwokenPass,
            ...decryption
                        }
          return myreq
 
          }
          else
          {
            const myreq ={
              endtoendPass: true,
              gwokenPass: true,
              ...decryption
                          }
            return myreq
          }
          
      }
      else
      {
        const myreq ={
          endtoendPass: false,
          gwokenPass: false,
          ...apiReq
          
        }
        return myreq
      }
    
    }  
    else // api did not send encryption
    {
      // check if clientNr exist in API call and if it does check if end to end is enabled for that client
      const client = await Client.findOne({ clientNr: apiReq.body.clientNr });
      if (client.endtoend)
      {
        endtoendPass = false;
        gwokenPass = false;
        const myreq =
        {
        endtoendPass: endtoendPass,
        gwokenPass: gwokenPass,
        ...apiReq
        }
        return myreq
      }
      else
      { 
        endtoendPass = true;
        if (client.gwoken)
          {
          gwokenPass = await gwokenCorrect(apiReq.body); 
          const myreq ={
            endtoendPass: true,
            gwokenPass: gwokenPass,
            ...apiReq
                        }
          return myreq
 
          }
          else
          {
            const myreq ={
              endtoendPass: true,
              gwokenPass: true,
              ...apiReq
                          }
            return myreq
          }
      }
    }  

  

}


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
  module.exports.getDecodedBody = getDecodedBody;