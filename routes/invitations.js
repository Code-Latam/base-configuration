const Client = require("../models/Client");
const Chatbot = require("../models/Chatbot");
const Invite = require("../models/Invite");
const User = require("../models/User");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const Explorer = require("../models/Explorer");

const jwt = require('jsonwebtoken');

//Invite user

router.post("/invite", async (request, res) => {
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
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"email is a required field",req.body.apiPublicKey));
       return
      } 
 
      if (!req.body.chatbotKey)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.groups)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"groups is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.explorers)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorers is a required field",req.body.apiPublicKey));
       return
      } 


      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
       const user = await User.findOne({ chatbotKey: req.body.chatbotKey, email: req.body.email })
      if (user)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A user with this email already exists. Can't be invited again",req.body.apiPublicKey));
        return
       } 

       const secretKey = process.env.INVITE_SECRET_KEY ;
       // Data payload to include in the JWT
       const payload = req.body ;
       
       // Options for the JWT expires in 5 days
       const options = { expiresIn: '5d' };
       
       // Generate a JWT
       const token = jwt.sign(payload, secretKey, options);
 
   try 
   {
 
     var chatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey, clientNr: req.body.clientNr })
     if (chatbot) // we found a chatbot so we can create an invite for it
     {
         //create new user
           const newInvite = new Invite(
         {
           chatbotKey: req.body.chatbotKey,
           email: req.body.email,
           groups: req.body.groups,
           explorers: req.body.explorers,
         });
         const user = await newUser.save();
         res.status(200).json(user);
       
     } 
    else { res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No chatbot found to add this user to.",req.body.apiPublicKey));}
   } 
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });





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
    
    const users = await User.findOne({ clientNr: req.body.clientNr, chatbotKey: req.body.chatbotKey });
    if (!users) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No user found for this chatbot and name combination",req.body.apiPublicKey))}
    else {res.status(200).json(users) }
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
     if (!user) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No user found for this chatbot and email combination",req.body.apiPublicKey))}
     else 
      { // for each exploreid in user fetch the description construct the object and push in list
         const explorersIdList = user.explorers ;
         const result = [];
         for (const id of explorersIdList) {
            try {
               const explorer = await Explorer.findOne({ explorerId: id, clientNr: req.body.clientNr });
               if (explorer) {
               result.push({ id: explorer.explorerId, description: explorer.name });
               } 
            } catch (error) {
               console.error(`Error fetching explorer with ID ${id}:`, error);
            }
         }
         res.status(200).json(result) 
      }
   }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
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
    else {res.status(200).json(users) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});


module.exports = router;
