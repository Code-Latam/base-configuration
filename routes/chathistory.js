const router = require("express").Router();
const Chatbot = require("../models/Chatbot");
const Chathistory = require("../models/Chathistory");
const bcrypt = require("bcrypt");

//ADD to Chathistory
router.post("/add", async (req, res) => {
  const client = await Client.findOne({ clientNr: req.body.clientNr })
  if (!client)
   {
    res.status(401).json("client number does not exist");
    return
   }  
try {
    //create new entry in chat history using chathistory model
    const callerchatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
    if (!callerchatbot)
     {res.status(401).json("caller has no rights to create or query chatbot history items")}
    else
    {
      const newChathistory = new Chathistory({
      chatbotKey: req.body.chatbotKey,
      chatRequestResult: req.body.chatRequestResult,
      prompt:  req.body.prompt,
      answer:  req.body.answer,
      });
  
      //save cand respond
      const chathistoryItem = await newChathistory.save();
      res.status(200).json(chathistoryItem);
    }
    } 
    catch (err) {
      res.status(500).json(err)
    }
});

// Get all chat for a chatbot in a certain period
router.post("/queryperiod", async (req, res) => {
  const client = await Client.findOne({ clientNr: req.body.clientNr })
  if (!client)
   {
    res.status(401).json("client number does not exist");
    return
   }  
    try {
      if (req.body.chatRequestResult === "ALL")
      {
      const chathistory = await Chathistory.find({
        timestamp: {
          $gte: req.body.start,
          $lte: req.body.end
        },
        chatbotKey: req.body.chatbotKey
      });
      if (chathistory.length === 0) {res.status(404).json("No chat history found for this chatbot")}
      else {res.status(200).json(chathistory) }
      }
      else
      {
        const chathistory = await Chathistory.find({
            timestamp: {
              $gte: req.body.start,
              $lte: req.body.end
            },
            chatbotKey: req.body.chatbotKey,
            chatRequestResult: req.body.chatRequestResult
          });
          if (chathistory.length === 0) {res.status(404).json("No chat history found for this chatbot")}
          else {res.status(200).json(chathistory) }
      }
      
      }
      catch (err) {
      res.status(500).json(err);
    }
  });

// Count all chat for a chatbot in a certain period
  router.post("/queryperiodcount", async (req, res) => {
    const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
    try {
      if (req.body.chatRequestResult === "ALL")
      {
      const count = await Chathistory.find({
        timestamp: {
          $gte: req.body.start,
          $lte: req.body.end
        },
        chatbotKey: req.body.chatbotKey
      }).countDocuments();
      res.status(200).json(count) ;
      }
      else
      {
        const count = await Chathistory.find({
            timestamp: {
              $gte: req.body.start,
              $lte: req.body.end
            },
            chatbotKey: req.body.chatbotKey,
            chatRequestResult: req.body.chatRequestResult
          }).countDocuments();
          res.status(200).json(count) ;
      }
      
      }
      catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;