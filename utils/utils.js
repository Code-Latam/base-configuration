const Client = require("../models/Client");
const crypto = require('crypto-js');

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

// bring both key and message to 64 base

var ekeydecodedfrom64 = forge.util.decode64(body.ekey)
var messagedecodedfrom64 = forge.util.decode64(body.message);

// We will first decrypt the key that was used to encrypt the message

const decryptedAESkey = privateKey.decrypt(ekeydecodedfrom64, 'RSA-OAEP');

console.log("Dycrypted ekey:");
console.log(decryptedAESkey);

// now we will decrypt the message

var decipher = forge.cipher.createDecipher('AES-CBC', decryptedAESkey);
decipher.start({iv: decryptedAESkey}); // use the same key as iv for simplicity
decipher.update(forge.util.createBuffer(messagedecodedfrom64));
decipher.finish();
var decryptedData = decipher.output.getBytes();

// Convert the decrypted data to a JSON object

try {
  const data = JSON.parse(decryptedData);
  console.log("Decrypted JSON:");
  console.log(data);
  return (
  {
    result: true,
    body: {
      ...data
    }
  })
  
} 
catch (error) {
  return (
    {
      result: false
    })
}
 

  };




async function  CalculateSignature(token,parameters)
{
    // calculate the hash value of the token
    console.log("PARAMETER PASSED TO CALCULATESIGNATURE");
    console.log(parameters);
    
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

  const mycleanedbody = removeProperty("gwoken", body)

  console.log("BODY PASSED TO GWOKENCORRECT");
  console.log(body);
  
   if (!body.gwoken)
  {
    console.log("NO GWOKEN provided");
    return false
   }
  
  const client = await Client.findOne({ clientNr: body.clientNr });

  const backendsignature = await CalculateSignature(client.clientToken,mycleanedbody);
  
  
  console.log("FRONTEND GWOKEN SIGNATURE");
  console.log(body.gwoken);
  console.log("BACKEND GWOKEN SIGNATURE =");
  console.log(backendsignature);
  
  
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
  var encryptresponse = false;
  

    if (apiReq.body.ekey) // API is sending encryption
    {
      // get the body and result of the decription
      const decryption = endToEndDecrypt(apiReq.body);
      endtoendPass = decryption.result
        
      
      if (endtoendPass) // body was succesfully decrypted
      {   
        const client = await Client.findOne({ clientNr: decryption.body.clientNr });
        if (client?.endtoend)
          {encryptresponse = true}
        else { encryptresponse = false}   

          if (decryption.body.gwoken)
          {
          gwokenPass = await gwokenCorrect(decryption.body); 
          const myreq ={
            endtoendPass: true,
            gwokenPass: gwokenPass,
            encryptresponse: encryptresponse,
            ...decryption
                        }
          return myreq
 
          }
          else
          {
            //noo Gwoken supplied in body
            const client2 = await Client.findOne({ clientNr: decryption.body.clientNr });
              if (client2?.gwoken) // client has gwoken enabled
              {
                const myreq ={
                  endtoendPass: true,
                  gwokenPass: false,
                  encryptresponse: encryptresponse,
                  ...decryption
                              }
                return myreq
              }
              else
              {
              const myreq ={
              endtoendPass: true,
              gwokenPass: true,
              encryptresponse: encryptresponse,
              ...decryption
                          }
              return myreq
              }


          }
          
      }
      else // body was not succesfully decrypted
      {
        
        const myreq ={
          endtoendPass: false,
          gwokenPass: false,
          encryptresponse: false,
          ...apiReq
          
        }
        return myreq
      }
    
    }  
    else // api did not send encryption
    {
      // check if clientNr exist in API call and if it does check if end to end is enabled for that client
      const client = await Client.findOne({ clientNr: apiReq.body.clientNr });
      if (client?.endtoend)
      {
        endtoendPass = false;
        gwokenPass = true;
      
        const myreq =
        {
        endtoendPass: endtoendPass,
        gwokenPass: gwokenPass,
        encryptresponse: false,
        ...apiReq
        }
        return myreq
      }
      else
      { 
        endtoendPass = true;
        if (client?.gwoken)
          {
          gwokenPass = await gwokenCorrect(apiReq.body); 
          const myreq ={
            endtoendPass: true,
            gwokenPass: gwokenPass,
            encryptresponse: false,
            ...apiReq
                        }
          return myreq
 
          }
          else
          {
            const myreq ={
              endtoendPass: true,
              gwokenPass: true,
              encryptresponse: false,
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
  
function Encryptresponse(encrypt, body, remotepublickeyPEM)  
// note body is a string or an object
 {
   if (!encrypt)
   return body

// convert the backend publickey to a forge publickey object

if (!remotepublickeyPEM) // api public key was not provided
{
return "no Public key provided by API consumer";
}


const publicKey = forge.pki.publicKeyFromPem(remotepublickeyPEM);

/**** START Encrypt AES with assymetric RSA-OAEP key and set body ekey variable ****/

const aesKey = forge.random.getBytesSync(16); // generate random 16 bits key

const encryptedaesKey = publicKey.encrypt (aesKey, 'RSA-OAEP');
var encoded64encryptedaesKey = forge.util.encode64 (encryptedaesKey); 

var myencryptedreturbody = 
{
  ekey:encoded64encryptedaesKey,
  message: "none"
}

/**** END OF Encrypt AES key and set body ekey variable ****/

/**** START Encrypt message with symetric AES key and set body message variable ****/


var originalMessageString = JSON.stringify(body);

var cipher = forge.cipher.createCipher('AES-CBC', aesKey);
cipher.start({iv: aesKey}); // use the same key as iv for simplicity
cipher.update(forge.util.createBuffer(originalMessageString));
cipher.finish();
var encryptedMessage = cipher.output.getBytes(); // get encrypted message
var ecoded64encryptedMessage = forge.util.encode64(encryptedMessage); // encode to 64 so it can be sent

myencryptedreturbody.message = ecoded64encryptedMessage;

return myencryptedreturbody;

/**** END OF Encrypt message with symetric AES key and set body message variable ****/


 }

  module.exports.gwokenCorrect = gwokenCorrect;
  module.exports.generateIds = generateIds;
  module.exports.validopenai = validopenai;
  module.exports.getDecodedBody = getDecodedBody;
  module.exports.Encryptresponse = Encryptresponse;