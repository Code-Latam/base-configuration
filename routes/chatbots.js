const router = require("express").Router();
const Chatbot = require("../models/Chatbot");
const User = require("../models/User");
const Client = require("../models/Client");
const utils = require("../utils/utils.js");
const bcrypt = require("bcrypt");
const axios = require("axios");
var {ChromaClient} = require('chromadb');
var {OpenAIEmbeddingFunction} = require('chromadb');
const fs = require('fs')
const { PuppeteerWebBaseLoader } = require("langchain/document_loaders/web/puppeteer");
const { CheerioWebBaseLoader } =  require("langchain/document_loaders/web/cheerio");
const {convert} = require('html-to-text');
var request = require ('request-promise');
var request2 = require ('request-promise');
var docsarray = [];
var sourcesarray = [];
var urls = [];
var mycounter = 0;

function cleanupText(text) {
  // remove line breaks from start and end of string 
  text = text.trim();
  // replace two or more spaces with a single space
  text = text.replace(/ {2,}/g, ' ');
  // replace two or more line breaks with two line breaks
  text = text.replace(/[\n\r]{2,}/g, '\n\n');
  return text;
 }



async function validurl(url){
  const regex = /^(https?|ftp):\/\/([a-z0-9+!*(),;?&=.-]+(:[a-z0-9+!*(),;?&=.-]+)?@)?([a-z0-9-.]*)(\.([a-z]{2,3}))(:[0-9]{2,5})?(\/([a-z0-9+%-]\.?)+)*\/?(\?([a-z+&$_.-][a-z0-9;:@&%=+/$_.-]*)?)?(#[a-z_.-][a-z0-9+$_.-]*)?$/i;  
  if (!regex.test(url))
  {
  return false
  }
  try
       {
       let aliveresponse = await axios.get(req.body.url);
       if (aliveresponse.status != 200) {
         // the page is not alive
         return false
                                      }
        }
        catch(error) {
          return false
        }



}

async function crawl(url,crawlthisurl,chunksize)
{
  // when entering this function the url must be vaild. 
  

  if  (!crawlthisurl)  // just return the docs for this url do not crawl  
  {
    const loader = new PuppeteerWebBaseLoader(url, {
      launchOptions: {
        headless: "new",args: ['--no-sandbox']
      }});
    const docs = await loader.load();
    const myinitialdocsarray = [];
    const myinitialsourcesaray = [];
      for (let mydoc of docs) { // Loop through each object in the array
        const html = mydoc.pageContent;
        const mytext = convert(html, { preserveNewlines:true,
          selectors: [{ selector: 'img', format: 'skip' } ]
        });
        const mycleantext = cleanupText(mytext);
        myinitialdocsarray.push(mycleantext); 
        myinitialsourcesaray.push(url);
      }
  
      const mychunkedobject = chunkArray(myinitialdocsarray,myinitialsourcesaray,chunksize)
      
        docsarray.push(...mychunkedobject.resultdocsarray);
        sourcesarray.push(...mychunkedobject.resultsourcesarray);

      return
  }    

  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: "new",args: ['--no-sandbox']
    }});
  mycounter = mycounter+1;
  if (mycounter>=2)
  {return}


  const docs = await loader.load();
  const myinitialdocsarray = [];
  const myinitialsourcesaray = [];
  for (let mydoc of docs) { // Loop through each object in the array
        const html = mydoc.pageContent;
        const mytext = convert(html, { preserveNewlines:true,
          selectors: [{ selector: 'img', format: 'skip' } ]
        });
        const mycleantext = cleanupText(mytext);
        myinitialdocsarray.push(mycleantext); 
        myinitialsourcesaray.push(url);
      
  }
  // remove these comments:
  const mychunkedobject = chunkArray(myinitialdocsarray,myinitialsourcesaray,chunksize)
  docsarray.push(...mychunkedobject.resultdocsarray);
  sourcesarray.push(...mychunkedobject.resultsourcesarray);

  // get links from the html page;
  const html = docs[0].pageContent;
  const { parse } = require("node-html-parser");
  const root = parse(html);
  const links = root.querySelectorAll("a");

  for (let link of links) {
    // Get the href attribute of the link
    let href = link.getAttribute('href');
   
    // Check if the href is valid and not external
    if (href && href.startsWith('/') && !href.startsWith('//')) {
    // Check if the url is already in the array
    if (!urls.includes(url+href)) {
    // Add the url to the array if valid
        if (validurl(url+href))
          {
          urls.push(url+href);
          // Crawl the url recursively
          await crawl(url+href, true,chunksize);
          }

                                  }
    }
    }
 return

  

  
}


function createSourceArray(length, source) {
  let result = [];
  for (let i = 0; i < length; i++) {
    result.push(source);
  }
  return result;
}


function chunkArray(array,arraysources, size) {
  let resultdocsarray = [];
  let resultsourcesarray = [];
  for (let i = 0; i < array.length; i++) {
  let element = array[i];
  let start = 0; // initialize the start index
  while (start < element.length) { // loop until the end of the element
  let end = start + size; // calculate the end index
  let chunk = element.slice(start, end); // get the chunk using slice
  resultdocsarray.push(chunk); // push the chunk to the result
  resultsourcesarray.push(arraysources[i]); // push the source to the result
  start = end; // update the start index
  }
  }
  console.log(resultsourcesarray);
  const result = { resultdocsarray: resultdocsarray,
  resultsourcesarray: resultsourcesarray};
  return result;
  }


function isValidname(value) {
  // Use a regular expression to test if the value matches the pattern
  // The pattern is: start with a letter or number, followed by zero or more letters or numbers, and end with a letter or number
  // The flag i means case-insensitive
  let pattern = /^[a-z0-9][a-z0-9]*[a-z0-9]$/;
  return pattern.test(value);
}

//REGISTER
router.post("/register", async (request, res) => {
  // const salt = await bcrypt.genSalt(10);
  // const hashedchatbotKey = await bcrypt.hash(req.body.chatbotKey, salt);
  // const hashedopenaiKey = await bcrypt.hash(req.body.openaiKey, salt);

  const CHROMA_URL = process.env.CHROMA_URL ;
  
  const req = await utils.getDecodedBody(request);

  if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  // check required fields of the body

  

  if (!req.body.clientNr)
     {
      res.status(410).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

  if (!req.body.chatbotMaster)
     {
      res.status(413).json(utils.Encryptresponse(req.encryptresponse,"chatbotMaster is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.chatbotKey)
     {
      res.status(414).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 
  try {

    const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
      return
     }  
  

  // check if there is any chatbot for this client:
  const anychatbot = await Chatbot.findOne({  clientNr: req.body.clientNr })
  if (anychatbot)
  {
    const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" },{ clientNr: req.body.clientNr } ] })
    if (!chatbotmaster)
    {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"chatbotmaster has no rights to create, maintain or query chatbots",req.body.apiPublicKey));
      return
    }
  }
   
   const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
      if (mychatbot)
        {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A chatbot with this chatbotKey already exists!",req.body.apiPublicKey))
        return
      }

   if (!isValidname(req.body.name))
    {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"chatbot not registered. Chatbot name can only contain lowercase letters, numbers and no spaces.",req.body.apiPublicKey));
      return
    }

    const validaikey = await utils.validopenai(req.body.openaiKey)
    console.log(validaikey);
    if (!validaikey)
    { 
      
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot not registered OpenAI Key is not valid or working.",req.body.apiPublicKey));
      return
    }
  

    
    const mycustomPrompt = `You are a Bot assistant answering any questions about documents. 
    You are given a question and a set of documents.
    If the user's question requires you to provide information from the documents, 
    give your answer first based on the examples provided in the documentation below. 
    if you don't find an answer in the provided examples you can provide another answer.
    If your answer is not from the documentation provided or if there in No Documentation tell the user that you didn't find the answer in the documentation and provide an other answer and 
    rephrase his query with more details. Use bullet points if you have to make a list, only if necessary. 
    QUESTION: {question} 
    DOCUMENTS: 
    ========= {context} ========= 
    Finish by proposing your help for anything else.`

   //create new Chatbot using chatbot model

    const newChatbot = new Chatbot({
    clientNr: req.body.clientNr,
    chatbotKey: req.body.chatbotKey,
    openaiKey: req.body.openaiKey,
    descriptiveName:  req.body.descriptiveName,
    name:  req.body.name,
    email:  req.body.email,
    initialPassword: req.body.initialPassword,
    publicbot:  req.body.publicbot,
    paid:  req.body.paid,
    enabled:  req.body.enabled,
    isAdminModule: req.body.isAdminModule,
    chatbotMaster: req.body.chatbotMaster,
    promptTemplate:  mycustomPrompt,
    idEnroller:  req.body.idEnroller,
    });

   console.log(newChatbot);
   //hello

    //save chatbot and
    const chatbot = await newChatbot.save();

    // Create one user for the chatbot
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(req.body.initialPassword, salt);

    const newUser = new User({
      chatbotKey: req.body.chatbotKey,
      username: "Admin",
      email:  req.body.email,
      password:  hashedpassword,
      isAdmin:  true,
      groups:["apiFnyDesigners", "chatbotDesigners"]
      });
    console.log(newUser)
    // save new user
      const newuser = await newUser.save();
    console.log(newuser);

    // create collection in Croma
    const chroma_client = new ChromaClient(CHROMA_URL);
    const embedder = new OpenAIEmbeddingFunction(req.body.openaiKey); 
    const collection = await chroma_client.createCollection(req.body.name, {}, embedder);

    const resp = await collection.add(["CHATBOTKIND"],
      undefined,
      ["author"],
      [" I am a happy chatbot"], ) ;
    
    console.log(resp);

    res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Chatbot was succesfully registered",req.body.apiPublicKey));
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});

// Get base config info for a chatbot

// Get base config info for one chatbot
router.post("/query", async (request, res) => {

  // Get the usere request body of the request.
  // The API received by this backen can be of 4 types
  // ENDtoEND and GWOKEN
  // GWOKEN 
  // ENDtoEND
  // NORMAL


  
  const req = await utils.getDecodedBody(request);

  if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  // check required fields of the body

  

  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

  if (!req.body.chatbotMaster)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotMaster is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.chatbotKey)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 



  try {
    const chatbotmaster = await Chatbot.findOne({ $and: [{ clientNr: req.body.clientNr },{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
    if (!chatbotmaster)
      {res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbot master has no rights to create, maintain or query chatbots for this client",req.body.apiPublicKey))}
    else
    {
    const chatbot = await Chatbot.findOne({
      $and: [        
          { chatbotKey: req.body.chatbotKey },
          { chatbotMaster: req.body.chatbotMaster },
          { clientNr: req.body.clientNr }
      ]
    })
    const { password, updatedAt, ...other } = chatbot._doc;
    res.status(200).json(utils.Encryptresponse(req.encryptresponse,other,req.body.apiPublicKey));
    }
  } 
  catch (err) {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"chatbot was not found",req.body.apiPublicKey));
  }
});

// Get master chatbot
router.post("/getmaster", async (req, res) => {
  
  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
  {
  res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
  return
  }
  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  

  try {
      const chatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey})
      const { password, updatedAt, ...other } = chatbot._doc;
      res.status(200).json(other);
      return
    }
  catch (err) 
  {
    res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});






// Get base information for all chatbots
router.post("/queryall", async (request, res) => {

console.log("request body");
console.log(request.body);

const req = await utils.getDecodedBody(request);

if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  // check required fields of the body

  

  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

  if (!req.body.chatbotMaster)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotMaster is a required field",req.body.apiPublicKey));
      return
     } 
  
  const client = await Client.findOne({ clientNr: req.body.clientNr })
  if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  

  
  try {
    const chatbotMaster = await Chatbot.findOne({ $and: [{ clientNr: req.body.clientNr }, { chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
    if (!chatbotMaster)
      {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"chatbot master has no rights to create, maintain or query chatbots for this client",req.body.apiPublicKey))}
    else
    {
    
    const chatbots = await Chatbot.find({
      $or: [
        {chatbotKey:req.body.chatbotMaster},
        {chatbotMaster:req.body.chatbotMaster}
      ]
    });
    res.status(200).json(utils.Encryptresponse(req.encryptresponse,chatbots,req.body.apiPublicKey));
    }
  } 
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"no chatbots found for this chatbotMaster",req.body.apiPublicKey));
  }
});


// Get all chatbots by client!
router.post("/queryallbyclient", async (request, res) => {

  const req = await utils.getDecodedBody(request);

if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  // check required fields of the body

  

  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

  
  const client = await Client.findOne({ clientNr: req.body.clientNr })
  if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  
    
    try {
      
      const chatbots = await Chatbot.find({clientNr:req.body.clientNr});
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,chatbots,req.body.apiPublicKey));
      } 
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"no chatbots were found for this client, please check your clientNr",req.body.apiPublicKey))
    }
  });


//delete chatbot
router.post("/delete", async (request, res) => {

  const req = await utils.getDecodedBody(request);

  if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  // check required fields of the body

  

  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

  if (!req.body.chatbotMaster)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotMaster is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.chatbotKey)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  

  const CHROMA_URL = process.env.CHROMA_URL ;

  
    try {

      const chatbotmaster = await Chatbot.findOne({ $and: [{ clientNr: req.body.clientNr },{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
      if (!chatbotmaster)
        {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"chatbot master has no rights to create, maintain or query chatbots for this client",req.body.apiPublicKey))}
      else
      {
      const mychatbot = await Chatbot.findOneAndDelete(
        {
          $and: [        
              { chatbotKey: req.body.chatbotKey },
              { chatbotMaster: req.body.chatbotMaster },
              { clientNr: req.body.clientNr }
          ]
        });
      if (mychatbot) 
      {
        // delete users asociated with the chatbot
        await User.deleteMany({chatbotKey: req.body.chatbotKey});
        const chroma_client = new ChromaClient(CHROMA_URL);
        await chroma_client.deleteCollection(mychatbot.name);
        res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Chatbot has been deleted",req.body.apiPublicKey));
      }
      else { res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Chatbot has not been deleted. Not found. Please check ClientNr, chatbotMaster and chatbotKey.",req.body.apiPublicKey)) }
      }
    } catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
    }
  } );
  
 
  //update chatbot
router.post("/update", async (request, res) => {

  const req = await utils.getDecodedBody(request);

  if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  // check required fields of the body

  

  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

  if (!req.body.chatbotMaster)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotMaster is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.chatbotKey)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  


    try {
      const chatbotMaster = await Chatbot.findOne({ $and: [{ clientNr: req.body.clientNr }, { chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
      if (!chatbotMaster)
        {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"caller has no rights to create, maintain or query chatbots for this client",req.body.apiPublicKey))}
      else
      {
      const mychatbot = await Chatbot.findOneAndUpdate( {
        $and: [        
            { chatbotKey: req.body.chatbotKey },
            { chatbotMaster: req.body.chatbotMaster },
            { clientNr: req.body.clientNr }
        ]
      }, {
        $set: req.body,
      });
      if (mychatbot) {res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Chatbot has been updated",req.body.apiPublicKey))}
      else { res.status(404).json(utils.Encryptresponse(req.encryptresponse,"chatbot has not been updated. Please check clientNr, chatbotMaster and chatbotKey",req.body.apiPublicKey)) }
    }
    } catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
  } );


   //just a test in order to see if the backen is working
router.post("/test", async (req, res) => {
  res.status(200).json("test is ok. Apis do arrive")
  }
 );


 // add documents to chatbot
 router.post("/adddocs", async (request, res) => {
 
   
 
  const CHROMA_URL = process.env.CHROMA_URL ;
 
  const req = await utils.getDecodedBody(request);

  if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  // check required fields of the body

  

  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

  if (!req.body.chatbotMaster)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotMaster is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.chatbotKey)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  

       const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
      if (!chatbotmaster)
         {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot master has no rights to create, maintain or query chatbots",req.body.apiPublicKey))
         return
       }

      const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
      if (!mychatbot)
        {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot does not exist",req.body.apiPublicKey))
        return
      }

      const validaikey = await utils.validopenai(mychatbot.openaiKey)
      if (!validaikey)
      { 
      
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Documents were NOT added. OpenAI Key is not valid or working. Please update your chatbot with a valid OpenAI key.",req.body.apiPublicKey));
        return
      }
  
      // check if the length of the documents array is the same as the indexes array
      if (req.body.documents.length != req.body.sources.length)
      {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"The documents list must have the same number of elements as the sources list",req.body.apiPublicKey))
        return
      }
      const myindexes = utils.generateIds(req.body.documents.length)

     try {
        console.log("In try loop");
        const chroma_client = new ChromaClient(CHROMA_URL);
        const embedder = new OpenAIEmbeddingFunction(mychatbot.openaiKey)
        const collection = await chroma_client.getCollection(mychatbot.name, embedder)
        await collection.add(
          myindexes,
            undefined,
            req.body.sources,
            req.body.documents,
        ) 

        res.status(200).json(utils.Encryptresponse(req.encryptresponse,"documents have been added",req.body.apiPublicKey))
        return
     } catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
     }
   } );

   // add url pages to chatbot
 router.post("/addurl", async (request, res) => {

  const CHROMA_URL = process.env.CHROMA_URL ;
 
  const req = await utils.getDecodedBody(request);

  if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  // check required fields of the body

  

  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

  if (!req.body.chatbotMaster)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotMaster is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.chatbotKey)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  

       const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
      if (!chatbotmaster)
         {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot master has no rights to create, maintain or query chatbots",req.body.apiPublicKey))
         return
       }

      const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
      if (!mychatbot)
        {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot does not exist",req.body.apiPublicKey))
        return
      }

      const validaikey = await utils.validopenai(mychatbot.openaiKey)
      if (!validaikey)
      { 
      
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"The URL page was NOT added. OpenAI Key is not valid or working. Please update your chatbot with a valid OpenAI key.",req.body.apiPublicKey));
        return
      }
  
     const regex =
      /^(https?|ftp):\/\/([a-z0-9+!*(),;?&=.-]+(:[a-z0-9+!*(),;?&=.-]+)?@)?([a-z0-9-.]*)(\.([a-z]{2,3}))(:[0-9]{2,5})?(\/([a-z0-9+%-]\.?)+)*\/?(\?([a-z+&$_.-][a-z0-9;:@&%=+/$_.-]*)?)?(#[a-z_.-][a-z0-9+$_.-]*)?$/i;

    if (!regex.test(req.body.url))
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"The URL is not valid",req.body.apiPublicKey));
      return
     }

     try
       {
       let aliveresponse = await axios.get(req.body.url);
       if (aliveresponse.status != 200) {
         // the page is alive
         res.status(401).json(utils.Encryptresponse(req.encryptresponse,"The URL does not respond",req.body.apiPublicKey));
         return
                                      }
        }
        catch(error) {
          res.status(401).json(utils.Encryptresponse(req.encryptresponse,"The URL does not respond",req.body.apiPublicKey));
          return
        }
     // empty global arrays
        docsarray.length= 0;
        sourcesarray.length = 0;
        urls.length = 0;
    
    await crawl(req.body.url,false,5000);

    console.log(docsarray[0])

    const myindexes = utils.generateIds(docsarray.length)

    try {
       const chroma_client = new ChromaClient(CHROMA_URL);
       const embedder = new OpenAIEmbeddingFunction(mychatbot.openaiKey)
       const collection = await chroma_client.getCollection(mychatbot.name, embedder)
       await collection.add(
         myindexes,
           undefined,
           sourcesarray,
           docsarray
       ) 

       res.status(200).json(utils.Encryptresponse(req.encryptresponse,"URL page added",req.body.apiPublicKey));
       return;
     } 
     catch (err) 
     {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields" +  "CHROMA_URL: " + CHROMA_URL + " OPANAIKEY: " + mychatbot.openaiKey + "CHATBOT NAME:" + mychatbot.name, req.body.apiPublicKey))
       return
      }
      } );
     



  // Crawl pages give a URL and add pages to chatbot
  router.post("/crawl", async (request, res) => {

  // set some constatnts
  const CHROMA_URL = process.env.CHROMA_URL ;
  
  const req = await utils.getDecodedBody(request);

  if (!req.endtoendPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"End to end encryption required or end to end encryption not correct",req.body.apiPublicKey));
      return
     }  

  if (!req.gwokenPass)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Gwoken required or GWOKEN calculation not correct",req.body.apiPublicKey));
      return
     }  


  // check required fields of the body

  

  if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

  if (!req.body.chatbotMaster)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotMaster is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.chatbotKey)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  

       const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
      if (!chatbotmaster)
         {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot master has no rights to create, maintain or query chatbots",req.body.apiPublicKey))
         return
       }

      const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
      if (!mychatbot)
        {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot does not exist",req.body.apiPublicKey))
        return
      }

      const validaikey = await utils.validopenai(mychatbot.openaiKey)
      if (!validaikey)
      { 
      
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"The URL pages were NOT added. OpenAI Key is not valid or working. Please update your chatbot with a valid OpenAI key.",req.body.apiPublicKey));
        return
      }
  
    const regex =
        /^(https?|ftp):\/\/([a-z0-9+!*(),;?&=.-]+(:[a-z0-9+!*(),;?&=.-]+)?@)?([a-z0-9-.]*)(\.([a-z]{2,3}))(:[0-9]{2,5})?(\/([a-z0-9+%-]\.?)+)*\/?(\?([a-z+&$_.-][a-z0-9;:@&%=+/$_.-]*)?)?(#[a-z_.-][a-z0-9+$_.-]*)?$/i;
  
      if (!regex.test(req.body.url))
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"The URL is not valid",req.body.apiPublicKey));
        return
       }
       try
       {
       let aliveresponse = await axios.get(req.body.url);
       if (aliveresponse.status != 200) {
         // the page is not alive
         res.status(401).json(utils.Encryptresponse(req.encryptresponse,"The URL does not respond",req.body.apiPublicKey));
         return
                                      }
        }
        catch(error) {
          res.status(401).json(utils.Encryptresponse(req.encryptresponse,"The URL does not respond",req.body.apiPublicKey));
          return
        }
      
    docsarray.length= 0;
    sourcesarray.length = 0;
    urls.length = 0;
    mycounter = 0;
  
    await crawl(req.body.url,true,5000);
     
    const myindexes = utils.generateIds(docsarray.length)
  
      try {
        const chroma_client = new ChromaClient(CHROMA_URL);
        const embedder = new OpenAIEmbeddingFunction(mychatbot.openaiKey)
        const collection = await chroma_client.getCollection(mychatbot.name, embedder)
       await collection.add(
          myindexes,
               undefined,
              sourcesarray,
              docsarray,
         ) 
  
        res.status(200).json(utils.Encryptresponse(req.encryptresponse,"URL pages added",req.body.apiPublicKey));
        return
        } catch (err) {
          res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
        }
    } );
  
  


module.exports = router;