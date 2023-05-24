const router = require("express").Router();
const Chatbot = require("../models/Chatbot");
const User = require("../models/User");
const Client = require("../models/Client");
const utils = require("../utils/utils.js");
const bcrypt = require("bcrypt");
var {ChromaClient} = require('chromadb');
var {OpenAIEmbeddingFunction} = require('chromadb');
const fs = require('fs')
const { PuppeteerWebBaseLoader } = require("langchain/document_loaders/web/puppeteer");
const {convert} = require('html-to-text');
var request = require ('request-promise');


function createSourceArray(length, source) {
  let result = [];
  for (let i = 0; i < length; i++) {
    result.push(source);
  }
  return result;
}


function chunkArray(array, size) {
  let result = [];
  for (let i = 0; i < array.length; i++) {
    let element = array[i];
    // var words = element.split(/\s+/);
     //let words = element.split(/\s+(?![^\w\s])/); // split the element by one or more spaces that are not followed by a special character
     let words = element.split(/(?<!\S)\s+(?!\S)/);
     for (let j = 0; j < words.length; j += size) {
      let chunk = words.slice(j, j + size).join(" "); // slice the words array by size and join them by spaces
      result.push(chunk); // push the chunk to the result
    }
  }
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
    idAdminModule: req.body.isAdminmodule,
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
        await chroma_client.deleteCollection(req.body.name);
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
      // check if the length of the documents array is the same as the indexes array
      if (req.body.documents.length != req.body.sources.length)
      {res.status(401).json("The documents list must have the same number of elements as the sources list")
        return
      }
      const myindexes = utils.generateIds(req.body.documents.length)

     try {
        const chroma_client = new ChromaClient(CHROMA_URL);
        const embedder = new OpenAIEmbeddingFunction(mychatbot.openaiKey)
        const collection = await chroma_client.getCollection(req.body.chatbotKey, embedder)
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
  const got = await import('got');

  
 
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

     
     
     const regex =
      /^(https?|ftp):\/\/([a-z0-9+!*(),;?&=.-]+(:[a-z0-9+!*(),;?&=.-]+)?@)?([a-z0-9-.]*)(\.([a-z]{2,3}))(:[0-9]{2,5})?(\/([a-z0-9+%-]\.?)+)*\/?(\?([a-z+&$_.-][a-z0-9;:@&%=+/$_.-]*)?)?(#[a-z_.-][a-z0-9+$_.-]*)?$/i;

    if (!regex.test(req.body.url))
     {
      res.status(401).json("The URL is not valid");
      return
     }
     try{
     await request (req.body.url);
     }
     catch(error)
     {
      res.status(401).json("Website indicated by URL is not live");
      return
     }
    
     

      /**
      * Loader uses `page.evaluate(() => document.body.innerHTML)`
      * as default evaluate function
      **/
    const loader = new PuppeteerWebBaseLoader(req.body.url);
    const docs = await loader.load();

    const mydocsarray = [];
    
    
    for (let mydoc of docs) { // Loop through each object in the array
      const html = mydoc.pageContent;
      const mytext = convert(html, { preserveNewlines:true,
        selectors: [{ selector: 'img', format: 'skip' } ]
      });
      mydocsarray.push(mytext); // Add the value of the property to the new array
    }

    // a page can be long so we need to chunk up this array

     const mychunkeddocs = chunkArray(mydocsarray,1024);
     const myarraylength = mychunkeddocs.length;

    // generate the sources array based on the length of the chuncked up array
    
    const mysourcesarray = createSourceArray(myarraylength, req.body.url)

    // console.log("array length: ");
    // console.log(mychunkeddocs.length)

    console.log(mychunkeddocs[0])
    // console.log(mysourcesarray)

     res.status(200).json("URL pages added");
     return



     // const myindexes = utils.generateIds(req.body.documents.length)

    //try {
      // const chroma_client = new ChromaClient(CHROMA_URL);
      // const embedder = new OpenAIEmbeddingFunction(mychatbot.openaiKey)
      // const collection = await chroma_client.getCollection(req.body.chatbotKey, embedder)
     //  await collection.add(
      //   myindexes,
      //     undefined,
       //    req.body.sources,
       //    req.body.documents,
      // ) 

       // res.status(200).json("documents have been added")
       //return
    // } catch (err) {
    //   res.status(500).json("An internal server error ocurred. Please check your fields")
    // }
  } );




module.exports = router;