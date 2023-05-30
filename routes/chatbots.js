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
      headless: "new"
    },gotoOptions: {
      waitUntil: "domcontentloaded",
    }
  
  });
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
router.post("/register", async (req, res) => {
  // const salt = await bcrypt.genSalt(10);
  // const hashedchatbotKey = await bcrypt.hash(req.body.chatbotKey, salt);
  // const hashedopenaiKey = await bcrypt.hash(req.body.openaiKey, salt);

  const CHROMA_URL = process.env.CHROMA_URL ;
  
  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
  {
    res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
      return
  }

  try {

    const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
    
  const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
  if (!chatbotmaster)
   {
    res.status(401).json("chatbotmaster has no rights to create, maintain or query chatbots");
    return
   }
   
   const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
      if (mychatbot)
        {res.status(401).json("Chatbot allready exists!")
        return
      }

   if (!isValidname(req.body.name))
    {
      res.status(401).json("chatbot not registered. Chatbot name can only contain lowercase letters, numbers and no spaces.");
      return
    }

    const validaikey = await utils.validopenai(req.body.openaiKey)
    console.log(validaikey);
    if (!validaikey)
    { 
      
      res.status(401).json("Chatbot not registered OpenAI Key is not valid or working.");
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
    idAdminModule: req.body.isAdminModule,
    chatbotMaster: req.body.chatbotMaster,
    promptTemplate:  mycustomPrompt,
    idEnroller:  req.body.idEnroller,
    });

   console.log(newChatbot);

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
      });
    console.log(newUser)
    // save new user
      const newuser = await newUser.save();
    console.log(newuser);

    // create collection in Croma
    const chroma_client = new ChromaClient(CHROMA_URL);
    const embedder = new OpenAIEmbeddingFunction(req.body.openaiKey); 
    const collection = await chroma_client.createCollection(req.body.name, {}, embedder);

    const resp = await collection.add(["GWOCU"],
      undefined,
      ["author"],
      [" This is a Gwocu Chatbot"], ) ;
    
    console.log(resp);

    res.status(200).json("Chatbot was succesfully registered");
  } catch (err) {
    res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});

// Get base config info for a chatbot

// Get base config info for one chatbot
router.post("/query", async (req, res) => {
  
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
    const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
    if (!chatbotmaster)
      {res.status(401).json("Chatbot master has no rights to create, maintain or query chatbots")}
    else
    {
    const chatbot = await Chatbot.findOne({
      $and: [
        {
          $or: [
            { chatbotKey: req.body.chatbotKey },
            { name: req.body.name }
          ]
        },
        { chatbotMaster: req.body.chatbotMaster }
      ]
    })
    const { password, updatedAt, ...other } = chatbot._doc;
    res.status(200).json(other);
    }
  } 
  catch (err) {
    res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});

// Get base config info for all chatbot
router.post("/queryall", async (req, res) => {

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
    const chatbotMaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
    if (!chatbotMaster)
      {res.status(401).json("Chatbot master has no rights to create, maintain or query chatbots")}
    else
    {
    const chatbots = await Chatbot.find({chatbotMaster:req.body.chatbotMaster});
    res.status(200).json(chatbots);
    }
  } 
  catch (err) {
    res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});


// Get all chatbots by client!
router.post("/queryallbyclient", async (req, res) => {

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
      
      const chatbots = await Chatbot.find({clientNr:req.body.clientNr});
      res.status(200).json(chatbots);
      } 
    catch (err) {
      res.status(500).json("An internal server error ocurred. Please check your fields")
    }
  });


//delete chatbot
router.post("/delete", async (req, res) => {

  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
  {
  res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
  return
  }

  const CHROMA_URL = process.env.CHROMA_URL ;
  const name = req.body.name;

  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
    try {

      const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
      if (!chatbotmaster)
        {res.status(401).json("Chatbot master has no rights to create, maintain or query chatbots")}
      else
      {
      const mychatbot = await Chatbot.findOneAndDelete({ chatbotKey: req.body.chatbotKey });
      if (mychatbot) 
      {
        // delete users asociated with the chatbot
        await User.deleteMany({chatbotKey: req.body.chatbotKey});
        const chroma_client = new ChromaClient(CHROMA_URL);
        await chroma_client.deleteCollection(mychatbot.name);
        res.status(200).json("Chatbot has been deleted")
      }
      else { res.status(404).json("Chatbot has not been deleted. Not found. Please check name and chatbotkey.") }
      }
    } catch (err) {
      res.status(500).json("An internal server error ocurred. Please check your fields")
    }
  } );
  
 
  //update chatbot
router.post("/update", async (req, res) => {

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
      const chatbotMaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
      if (!chatbotMaster)
        {res.status(401).json("caller has no rights to create, maintain or query chatbots")}
      else
      {
      const mychatbot = await Chatbot.findOneAndUpdate({ $and: [{ chatbotKey: req.body.chatbotKey }, { name: req.body.name }] }, {
        $set: req.body,
      });
      if (mychatbot) {res.status(200).json("Account has been updated")}
      else { res.status(404).json("Account has not been updated. Not found. Please check chatbotKey and name") }
    }
    } catch (err) {
      res.status(500).json("An internal server error ocurred. Please check your fields")
    }
  } );


   //just a test in order to see if the backen is working
router.post("/test", async (req, res) => {
  res.status(200).json("test is ok. Apis do arrive")
  }
 );


 // add documents to chatbot
 router.post("/adddocs", async (req, res) => {
 
   if (!utils.gwokenCorrect(req.body, req.body.gwoken))
   {
   res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
   return
   }
 
   const CHROMA_URL = process.env.CHROMA_URL ;
   const name = req.body.name;
 
   const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json("client number does not exist");
       return
      }  
      const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
      if (!chatbotmaster)
        {res.status(401).json("Chatbot master has no rights to create, maintain or query chatbots")
        return
      }

      const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
      if (!mychatbot)
        {res.status(401).json("Chatbot does not exist")
        return
      }

      const validaikey = await utils.validopenai(mychatbot.openaiKey)
      if (!validaikey)
      { 
      
        res.status(401).json("Documents were NOT added. OpenAI Key is not valid or working. Please update your chatbot with a valid OpenAI key.");
        return
      }
  
      // check if the length of the documents array is the same as the indexes array
      if (req.body.documents.length != req.body.sources.length)
      {res.status(401).json("The documents list must have the same number of elements as the sources list")
        return
      }
      const myindexes = utils.generateIds(req.body.documents.length)

     try {
        const chroma_client = new ChromaClient(CHROMA_URL);
        const embedder = new OpenAIEmbeddingFunction(mychatbot.openaiKey)
        const collection = await chroma_client.getCollection(mychatbot.name, embedder)
        await collection.add(
          myindexes,
            undefined,
            req.body.sources,
            req.body.documents,
        ) 

        res.status(200).json("documents have been added")
        return
     } catch (err) {
       res.status(500).json("An internal server error ocurred. Please check your fields")
     }
   } );

   // add url pages to chatbot
 router.post("/addurl", async (req, res) => {

 
  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
  {
  res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
  return
  }

  const CHROMA_URL = process.env.CHROMA_URL ;
  const name = req.body.name;

  const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
     const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
     if (!chatbotmaster)
       {res.status(401).json("Chatbot master has no rights to create, maintain or query chatbots")
       return
     }

     const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
     if (!mychatbot)
       {res.status(401).json("Chatbot does not exist")
       return
     }

     const validaikey = await utils.validopenai(mychatbot.openaiKey)
     if (!validaikey)
     { 
     
       res.status(401).json("URL was NOT added. OpenAI Key is not valid or working. Please update your chatbot with a valid OpenAI key.");
       return
     }
     
     const regex =
      /^(https?|ftp):\/\/([a-z0-9+!*(),;?&=.-]+(:[a-z0-9+!*(),;?&=.-]+)?@)?([a-z0-9-.]*)(\.([a-z]{2,3}))(:[0-9]{2,5})?(\/([a-z0-9+%-]\.?)+)*\/?(\?([a-z+&$_.-][a-z0-9;:@&%=+/$_.-]*)?)?(#[a-z_.-][a-z0-9+$_.-]*)?$/i;

    if (!regex.test(req.body.url))
     {
      res.status(401).json("The URL is not valid");
      return
     }

     try
       {
       let aliveresponse = await axios.get(req.body.url);
       if (aliveresponse.status != 200) {
         // the page is alive
         res.status(401).json("The URL does not respond");
         return
                                      }
        }
        catch(error) {
          res.status(401).json("The URL does not respond");
          return
        }
     // empty global arrays
        docsarray.length= 0;
        sourcesarray.length = 0;
        urls.length = 0;
    
    await crawl(req.body.url,false,5000);
    console.log(docsarray[1]);
    res.status(500).json("Just after crawl function")
    
    return

      
    console.log("array length: ");
    console.log(docsarray.length)

    console.log(docsarray[0])

    const myindexes = utils.generateIds(docsarray.length)

    try {
       const chroma_client = new ChromaClient(CHROMA_URL);
       res.status(500).json("Just after new chroma client" +  "CHROMA_URL: " + CHROMA_URL + " OPANAIKEY: " + mychatbot.openaiKey + "CHATBOT NAME:" + mychatbot.name)
       return
       const embedder = new OpenAIEmbeddingFunction(mychatbot.openaiKey)
       const collection = await chroma_client.getCollection(mychatbot.name, embedder)
       await collection.add(
         myindexes,
           undefined,
           sourcesarray,
           docsarray
       ) 

       res.status(200).json("URL page added");
       return;
     } 
     catch (err) 
     {
       res.status(500).json("Crawl An internal server error ocurred. Please check your fields" +  "CHROMA_URL: " + CHROMA_URL + " OPANAIKEY: " + mychatbot.openaiKey + "CHATBOT NAME:" + mychatbot.name)
       return
      }
      } );
     



  // Crawl pages give a URL and add pages to chatbot
  router.post("/crawl", async (req, res) => {

  // set some constatnts
  const CHROMA_URL = process.env.CHROMA_URL ;
  const name = req.body.name;

  // Testing of parameters in the request body  
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
    const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
       if (!chatbotmaster)
         {res.status(401).json("Chatbot master has no rights to create, maintain or query chatbots")
         return
       }
  
    const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
       if (!mychatbot)
         {res.status(401).json("Chatbot does not exist")
         return
       }

    const validaikey = await utils.validopenai(mychatbot.openaiKey)
     if (!validaikey)
     { 
     
       res.status(401).json("URL was NOT added. OpenAI Key is not valid or working. Please update your chatbot with a valid OpenAI key.");
       return
     }
  
    const regex =
        /^(https?|ftp):\/\/([a-z0-9+!*(),;?&=.-]+(:[a-z0-9+!*(),;?&=.-]+)?@)?([a-z0-9-.]*)(\.([a-z]{2,3}))(:[0-9]{2,5})?(\/([a-z0-9+%-]\.?)+)*\/?(\?([a-z+&$_.-][a-z0-9;:@&%=+/$_.-]*)?)?(#[a-z_.-][a-z0-9+$_.-]*)?$/i;
  
      if (!regex.test(req.body.url))
       {
        res.status(401).json("The URL is not valid");
        return
       }
       try
       {
       let aliveresponse = await axios.get(req.body.url);
       if (aliveresponse.status != 200) {
         // the page is alive
         res.status(401).json("The URL does not respond");
         return
                                      }
        }
        catch(error) {
          res.status(401).json("The URL does not respond");
          return
        }
      
    docsarray.length= 0;
    sourcesarray.length = 0;
    urls.length = 0;
    mycounter = 0;
  
    await crawl(req.body.url,true,5000);

    console.log("just left crawl:")
    console.log(mycounter)
    console.log(urls);

     
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
  
        res.status(200).json("URL pages added");
        return
        } catch (err) {
          res.status(500).json("An internal server error ocurred. Please check your fields")
        }
    } );
  
  


module.exports = router;