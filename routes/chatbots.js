const router = require("express").Router();
const Chatbot = require("../models/Chatbot");
const User = require("../models/User");
const bcrypt = require("bcrypt");
var {ChromaClient} = require('chromadb');
var {OpenAIEmbeddingFunction} = require('chromadb');
const fs = require('fs')




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
  


  try {
    //create new Chatbot using chatbot model
  const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
  if (!chatbotmaster)
   {
    res.status(401).json("chatbotmaster has no rights to create, maintain or query chatbots");
    return
   }
   if (!isValidname(req.body.name))
    {
      res.status(401).json("chatbot not registered. Chatbot name can only contain lowercase letters, numbers and no spaces.");
      return
    }
    
   
    const newChatbot = new Chatbot({
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
    promptTemplate:  req.body.promptTemplate,
    idEnroller:  req.body.idEnroller,
    });

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

    res.status(200).json(chatbot);
  } catch (err) {
    res.status(500).json(err)
    // res.status(500).json("An internal server error ocurred. Please check your fields")
  }
});

// Get base config info for a chatbot

// Get base config info for one chatbot
router.post("/query", async (req, res) => {
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
  res.status(500).json(err);
  }
});

// Get base config info for all chatbot
router.post("/queryall", async (req, res) => {
  
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
    res.status(500).json(err);
  }
});



//delete chatbot
router.post("/delete", async (req, res) => {
  const CHROMA_URL = process.env.CHROMA_URL ;
  const name = req.body.name;
    try {

      const chatbotmaster = await Chatbot.findOne({ $and: [{ chatbotKey: req.body.chatbotMaster },{ isAdminModule: "true" }] })
      if (!chatbotmaster)
        {res.status(401).json("Chatbot master has no rights to create, maintain or query chatbots")}
      else
      {
      const mychatbot = await Chatbot.findOneAndDelete({ $and: [{ chatbotKey: req.body.chatbotKey }, { name: name }] });
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
      return res.status(500).json(err);
    }
  } );
  
 
  //update chatbot
router.post("/update", async (req, res) => {

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
      return res.status(500).json(err);
    }
  } );


   //update chatbot
router.post("/test", async (req, res) => {
  res.status(200).json("test is ok. Apis do arrive")
  }
 );





module.exports = router;