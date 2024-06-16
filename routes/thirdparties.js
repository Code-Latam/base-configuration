const Client = require("../models/Client");
const Thirdparty = require("../models/Thirdparty");
const utils = require("../utils/utils.js");
const router = require("express").Router();

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
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
       return
      }  
      if (!req.body.name)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.description)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"description is a required field",req.body.apiPublicKey));
       return
      } 

      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
      const mythirdparty = await Thirdparty.findOne({ clientNr: req.body.clientNr, name: req.body.name })
      if (mythirdparty)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A third party object with this name allready exists for this client",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      const newThirdparty = new Thirdparty(
         {
           clientNr: req.body.clientNr,
           name: req.body.name,
           description: req.body.description,
           yaml: req.body.yaml,
         });
         const thirdparty = await newThirdparty.save();
         res.status(200).json(utils.Encryptresponse(req.encryptresponse,thirdparty,req.body.apiPublicKey));
         return
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

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  
      const mythirdparty = await Thirdparty.findOne({ clientNr: req.body.clientNr, name: req.body.name })
      if (!mythirdparty)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A thirdparty object with this name does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const thirdparty = await Thirdparty.findOneAndUpdate({ $and: [{ clientNr: req.body.clientNr }, { name: req.body.name }] }, {
    $set: req.body});
    if (!thirdparty) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The thirdparty object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Thirdparty object has been updated.",req.body.apiPublicKey)) }
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
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mythirdparty = await Thirdparty.findOne({ clientNr: req.body.clientNr, name: req.body.name })
      if (!mythirdparty)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"An thirdparty object with this name does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    var thirdparty = await Thirdparty.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { name: req.body.name }] });
    if (!thirdparty)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Thirdparty object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Thirdparty object has been deleted",req.body.apiPublicKey));
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
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mythirdparty = await Thirdparty.findOne({ clientNr: req.body.clientNr, name: req.body.name })
      if (!mythirdparty)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A thirdparty object with this name does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const thirdparties = await Thirdparty.findOne({ clientNr: req.body.clientNr, name: req.body.name });
    if (!thirdparties) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No thirdparty object found for this clientNr and name combination",req.body.apiPublicKey))}
    else 
    { 
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,thirdparties,req.body.apiPublicKey));
    }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});


// Query one explorer
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

 
      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
   try {
     
     const thirdparties = await Thirdparty.find({ clientNr: req.body.clientNr});
     if (!thirdparties) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No explorer object found for this clientNr",req.body.apiPublicKey))}
     else 
     {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,thirdparties,req.body.apiPublicKey));
     }
     }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }
 });


module.exports = router;
