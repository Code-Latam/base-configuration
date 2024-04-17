

const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const PromptTemplate = require("../models/PromptTemplate");

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
 
 
      if (!req.body.promptId)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"promptId is a required field",req.body.apiPublicKey));
       return
      } 
      if (!req.body.name)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.promptTemplate)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"promptTemplate is a required field",req.body.apiPublicKey));
       return
      } 

       console.log("Hello");
      const myprompt = await PromptTemplate.findOne({ promptId: req.body.promptId})
      if (myprompt)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A prompt template with this promptId already exists",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
    console.log("Hello2");
      const newPromptTemplate = new PromptTemplate(
         {
           promptId: req.body.promptId,
           name: req.body.name,
           promptTemplate: req.body.promptTemplate
         });
         const prompttemplate = await newPromptTemplate.save();
         res.status(200).json(prompttemplate);
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


     if (!req.body.promptId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"promptId is a required field",req.body.apiPublicKey));
      return
     } 

      const myprompt = await PromptTemplate.findOne({ promptId: req.body.promptId })
      if (!myprompt)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A prompt template object with this promptId does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const prompttemplate = await PromptTemplate.findOneAndUpdate({ promptId: req.body.promptId }, {
    $set: req.body});
    if (!prompttemplate) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The prompt template object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Prompt Template object has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );


//delete prompt template
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


     if (!req.body.promptId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"promptId is a required field",req.body.apiPublicKey));
      return
     } 

     const myprompt = await PromptTemplate.findOne({ promptId: req.body.promptId })
      if (!myprompt)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A prompt template object with this promptId does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    var prompttemplate = await PromptTemplate.findOneAndDelete({  promptId: req.body.promptId });
    if (!prompttemplate)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Prompt template object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"promt template object has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Query one prompt template
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


     if (!req.body.promptId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"promptId is a required field",req.body.apiPublicKey));
      return
     } 

     const myprompt = await PromptTemplate.findOne({ promptId: req.body.promptId })
      if (!myprompt)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A prompt template object with this promptId does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const prompttemplate = await PromptTemplate.findOne({ promptId: req.body.promptId });
    if (!prompttemplate) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No prompt template object found for this promptId",req.body.apiPublicKey))}
    else {res.status(200).json(prompttemplate) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});




module.exports = router;
