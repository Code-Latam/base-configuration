const Client = require("../models/Client");
const router = require("express").Router();
const bcrypt = require("bcrypt");

const dotenv = require("dotenv");
const utils = require("../utils/utils.js");
const jwt = require('jsonwebtoken');

function verifyToken(token) {
  try {
      // Verify the token using the same secret key
      const decoded = jwt.verify(token, process.env.INVITE_SECRET_KEY);
      return decoded;  // Returns the decoded payload if the token is valid
  } catch (error) {
      // Log the error which could be due to expiration or invalid token
      console.error('Invalid or expired token:', error.message);
      return null;  // Return null if the token is invalid or expired
  }
}

//Generate token based on secret key





router.post("/verifytoken", async (request, res) => {
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


  if (!req.body.token)
     {
     res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
     return
     }  

     const result = verifyToken(req.body.token)
     if (result) 
     {
        res.status(200).json(utils.Encryptresponse(req.encryptresponse,result,req.body.apiPublicKey));
   
     }       
     else 
     { 
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Token not valid or expired",req.body.apiPublicKey));
     }

  
});




module.exports = router;
