const Client = require("../models/Client");
const crypto = require('crypto-js');

function ENDtoENDDycrypt(body)

{

  // precondition api is sending body.myPublicKey
  // Get Keys of the backend They are in PEM format
  const backendPublicKey = process.env.PUBLIC_KEY ;
  const backendPrivateKey = process.env.PRIVATE_KEY ;

  // create encrytion object for the backend and set the keys

  backendEncryptionObject = crypto.createECDH('prime256v1');
  backendEncryptionObject.setPublicKey(backendPublicKey, 'hex');
  backendEncryptionObject.setPrivateKey(backendPrivateKey, 'hex');


  // get body parameters so we can start 

  remotePublicKey = body.mypublickey;
  remoteEncryptedJSON = body.message;
  remoteiv = body.iv;
  remoteTag = body.tag;

  // calculate the remote secret

  var remotesecret = backendEncryptionObject.computeSecret(remotePublicKey, 'hex', 'hex');

  // create decipher object

  var decipher = crypto.createDecipheriv('aes-256-gcm', remotesecret, remoteiv);

  // set the tage so we will no if the message has been tempered with

  decipher.setAuthTag(Buffer.from(remoteTag, 'hex'));

  // decipher the message

  try 
    {
    var decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');

    const mybody = 
    {
      result: false,
      ...decrypted
    }
    return mybody
    } 
    catch (error) 
    {
    // Handle the error
    console.error('Decryption failed:');
    const mybody = 
    {
      result: false
    }
    return mybody
    }







}

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

    return MySignature;

    
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



    if (apiReq.body.mypublickey) // API is sending encryption
    {
      // get the body and result of the decription
      const decryption = ENDtoENDDycrypt(apiReq.body);
      endtoendPass = decryption.result
      if (endtoendPass)
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