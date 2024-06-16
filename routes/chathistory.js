const router = require("express").Router();
const Client = require("../models/Client");
const Chatbot = require("../models/Chatbot");
const Chathistory = require("../models/Chathistory");
const utils = require("../utils/utils.js");
const bcrypt = require("bcrypt");

//ADD to Chathistory
router.post("/add", async (request, res) => {

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


      const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
      if (!mychatbot)
        {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot does not exist",req.body.apiPublicKey))
        return
      }
try {
    //create new entry in chat history using chathistory model
    
      const newChathistory = new Chathistory({
      chatbotKey: req.body.chatbotKey,
      chatRequestResult: req.body.chatRequestResult,
      prompt:  req.body.prompt,
      answer:  req.body.answer,
      });
  
      //save cand respond
      const chathistoryItem = await newChathistory.save();
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,chathistoryItem,req.body.apiPublicKey))
    } 
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Get all chat for a chatbot in a certain period
router.post("/queryperiod", async (request, res) => {

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


      const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
      if (!mychatbot)
        {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot does not exist",req.body.apiPublicKey))
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
      if (chathistory.length === 0) 
        {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No chat history found for this chatbot",req.body.apiPublicKey))
        return
        }
      else 
        {
        res.status(200).json(utils.Encryptresponse(req.encryptresponse,chathistory,req.body.apiPublicKey)) 
        return
        }
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
          if (chathistory.length === 0) 
          {
            res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No chat history found for this chatbot",req.body.apiPublicKey))
            return
          }
          else 
          {
            res.status(200).json(utils.Encryptresponse(req.encryptresponse,chathistory,req.body.apiPublicKey)) 
            return
          }
      }
      
      }
      catch (err) {
        res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
  });

// Count all chat for a chatbot in a certain period
  router.post("/queryperiodcount", async (request, res) => {
    
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
  
  
        const mychatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
        if (!mychatbot)
          {res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot does not exist",req.body.apiPublicKey))
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
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,count,req.body.apiPublicKey)) ;
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
          res.status(200).json(utils.Encryptresponse(req.encryptresponse,count,req.body.apiPublicKey)) ;
      }
      
      }
      catch (err) {
        res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
  });

module.exports = router;