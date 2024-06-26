const Client = require("../models/Client");
const User = require("../models/User");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const Explorer = require("../models/Explorer");

//update user
router.post("/update", async (request, res) => {

const req = await utils.getDecodedBody(request);
console.log("REQUESTBODY");
console.log(req.body);

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
    const salt = await bcrypt.genSalt(10);
    if (req.body.password)
    {
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const user = await User.findOneAndUpdate({ $and: [{ chatbotKey: req.body.chatbotKey }, { email: req.body.email }] }, {
    $set: req.body});
    if (!user) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"User has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"User has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );

//delete user
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
    const myuser = User.findOne({ $and: [{ chatbotKey: req.body.chatbotKey }, { email: req.body.email }] });
    if (myuser.name == "Admin")
    {
      res.status(406).json(utils.Encryptresponse(req.encryptresponse,"The administartive user cannot be deleted",req.body.apiPublicKey));
      return
    }
   try {
    var user = await User.findOneAndDelete({ $and: [{ chatbotKey: req.body.chatbotKey }, { email: req.body.email }] });
    if (!user)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"user not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"user has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Get user one user
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

     if (!req.body.email)
     {
      res.status(413).json(utils.Encryptresponse(req.encryptresponse,"email is a required field",req.body.apiPublicKey));
      return
     }  

     if (!req.body.chatbotKey)
     {
      res.status(414).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 
     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
  try {
    
    const users = await User.findOne({ clientNr: req.body.clientNr, chatbotKey: req.body.chatbotKey, email: req.body.email });
    if (!users) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No user found for this chatbot and name combination",req.body.apiPublicKey))}
    else
     {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,users,req.body.apiPublicKey));
     }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});

router.post("/explorers", async (request, res) => {

   const req = await utils.getDecodedBody(request);
   console.log("BODY");
   console.log(req.body);
 
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
 
   if (!req.body.chatbotKey)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
       return
      } 
   if (!req.body.email)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"email is a required field",req.body.apiPublicKey));
       return
      } 

   const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
   try 
   {
     
      const user = await User.findOne({ chatbotKey: req.body.chatbotKey, email: req.body.email });
      if (!user) {
          res.status(404).json(utils.Encryptresponse(req.encryptresponse, "No user found for this chatbot and email combination", req.body.apiPublicKey));
          return
      } else {
      
          const explorersNameList = user.explorers.map(explorer => explorer.name);
          const result = [];
          for (const name of explorersNameList) {
              try {
                  const explorer = await Explorer.findOne({ explorerId: name, clientNr: req.body.clientNr });
                  if (explorer) {
                      result.push({ id: explorer.explorerId, description: explorer.name });
                  } 
              } catch (error) {
                  console.error(`Error fetching explorer with name ${name}:`, error);
              }
          }
          res.status(200).json(utils.Encryptresponse(req.encryptresponse, result, req.body.apiPublicKey));
          return
      }
   }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
       return
      }
 });
 

// Get all users for a chatbot
router.post("/queryall", async (request, res) => {
  
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
    
    const users = await User.find({ chatbotKey: req.body.chatbotKey });
    if (!users) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No users found for this chatbot"),req.body.apiPublicKey)}
    else 
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,users,req.body.apiPublicKey));
      return;
    }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});


module.exports = router;
