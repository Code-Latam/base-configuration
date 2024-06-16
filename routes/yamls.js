const Client = require("../models/Client");
const Yaml = require("../models/Yaml");
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
 
 
      if (!req.body.yamlId)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"yamlId is a required field",req.body.apiPublicKey));
       return
      } 
      if (!req.body.name)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.yaml)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"yaml is a required field",req.body.apiPublicKey));
       return
      } 

       
      const myyaml = await Yaml.findOne({  yamlId: req.body.yamlId})
      if (myyaml)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"An yaml object with this yamlId already exists",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      const newYaml = new Yaml(
         {
          
           yamlId: req.body.yamlId,
           name: req.body.name,
           yaml: req.body.yaml,
         });
         const yaml = await newYaml.save();
         res.status(200).json(utils.Encryptresponse(req.encryptresponse,yaml,req.body.apiPublicKey));
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


     if (!req.body.yamlId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"yamlId is a required field",req.body.apiPublicKey));
      return
     } 

      const myyaml = await Yaml.findOne({ yamlId: req.body.yamlId })
      if (!myyaml)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A yaml object with this yamlId does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const yaml = await Yaml.findOneAndUpdate({ yamlId: req.body.yamlId }, {
    $set: req.body});
    if (!yaml) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The yaml object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Yaml object has been updated.",req.body.apiPublicKey)) }
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


     if (!req.body.yamlId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"yamlId is a required field",req.body.apiPublicKey));
      return
     } 

     const myyaml = await Yaml.findOne({ yamlId: req.body.yamlId })
      if (!myyaml)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A Yaml object with this yamlId does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    var yaml = await Yaml.findOneAndDelete({  yamlId: req.body.yanlId });
    if (!yaml)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Yaml object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Yaml object has been deleted",req.body.apiPublicKey));
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


     if (!req.body.yamlId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"yamlId is a required field",req.body.apiPublicKey));
      return
     } 

     const myyaml = await Yaml.findOne({ yamlId: req.body.yamlId })
      if (!myyaml)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A Yaml object with this yamlId does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const yaml = await Yaml.findOne({ yamlId: req.body.yamlId });
    if (!yaml) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No Yaml object found for this yamlId",req.body.apiPublicKey))}
    else 
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,yaml,req.body.apiPublicKey));
    }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});




module.exports = router;
