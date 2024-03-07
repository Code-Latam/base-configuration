const Client = require("../models/Client");
const Folder = require("../models/Folder");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// register explorer

router.post("/register", async (request, res) => {
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
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"clientNr is a required field",req.body.apiPublicKey));
       return
      } 
      
      if (!req.body.items)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"items is a required field",req.body.apiPublicKey));
       return
      } 
 

      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"clientNr does not exist",req.body.apiPublicKey));
        return
       } 
   try 
   {
   
      const newFolder = new Folder(
         {
           clientNr: req.body.clientNr,
           items: req.body.items
         });
         const folder = await newFolder.save();
         res.status(200).json(folder);
      }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });

//update explorer
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


if (!req.body.clientNr)
{
 res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
 return
}  


if (!req.body.items)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"items is a required field",req.body.apiPublicKey));
       return
      } 

  try {

    const folder = await Folder.findOneAndUpdate({ clientNr: req.body.clientNr }, {
    $set: req.body});
    if (!folder) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The folder object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"folder object has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );


//delete explorer
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
  

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"clientNr does not exist",req.body.apiPublicKey));
       return
      } 
      
   try {
    var folder = await Folder.findOneAndDelete({  clientNr: req.body.clientNr  }, { _id: 0 });
    if (!folder)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"folder object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"folder object has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Query one explorer
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

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"clientNr does not exist",req.body.apiPublicKey));
       return
      } 
  try {
    
    const folders = await Folder.findOne({ clientNr: req.body.clientNr}, { _id: 0 });
    if (!folders) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No folder object found for this clientNr and explorerId combination",req.body.apiPublicKey))}
    else {res.status(200).json(folders) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});




module.exports = router;
