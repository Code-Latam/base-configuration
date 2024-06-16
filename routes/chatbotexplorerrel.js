const ChatbotExplorerRel = require("../models/ChatbotExplorerRel");
const Client = require("../models/Client");
const Explorer = require("../models/Explorer");
const Yaml = require("../models/Yaml");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// register explorer


router.post("/query", async (request, res) => {

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


     if (!req.body.clientNr)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

     if (!req.body.explorerId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const myexplorer = await Explorer.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId })
      if (!myexplorer)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"An explorer object with this explorer ID does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    console.log("Hello");
    const chatbotexplorerrel = await ChatbotExplorerRel.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId });
    if (!chatbotexplorerrel) 
    {
      console.log("FAIL");
      res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No chatbot explorer relation object found for this clientNr and explorerId combination",req.body.apiPublicKey));
   }
    else 
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,chatbotexplorerrel,req.body.apiPublicKey))
      
   }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});





module.exports = router;
