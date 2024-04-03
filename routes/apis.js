const Client = require("../models/Client");
const Api = require("../models/Api");
const CustomUserApi = require("../models/CustomUserApi");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// register Task

router.post("/registercustom", async (request, res) => {
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
 
 
   if (!req.body.userClientNr)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"userClientNr is a required field",req.body.apiPublicKey));
       return
      }  
 

      if (!req.body.name)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
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

 

          
 
   try 
   {
      const query = {  userClientNr: req.body.userClientNr, name: req.body.name,chatbotKey: req.body.chatbotKey,email: req.body.email };
      const myCustomUserApiData = {
         ...req.body
      };

      console.log(req.body);
     
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };
      const customUserApi = await CustomUserApi.findOneAndUpdate(query, myCustomUserApiData, options);
      res.status(200).json(customUserApi);
      }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });


 router.post("/deletecustom", async (request, res) => {
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
 
 
   if (!req.body.userClientNr)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"userClientNr is a required field",req.body.apiPublicKey));
       return
      }  
 

      if (!req.body.name)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
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
 
   try 
   {
      const query = { userClientNr: req.body.userClientNr, name: req.body.name, chatbotKey: req.body.chatbotKey, email: req.body.email };
      const customerUserApi = await CustomUserApi.findOneAndDelete(query);
      if (!customerUserApi) {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse, "API not found, There is no custom version of this APi stored", req.body.apiPublicKey));
        return;
      }
      res.status(200).json(customerUserApi);
      return;

   }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });






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

      
       
      const myapi = await Api.findOne({ clientNr: req.body.clientNr, name: req.body.name })
      if (myapi)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"An api object with this name already exists for this clientNr and name",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      console.log(req.body);
      const newApi = new Api(
         {
            collectionTag: "Unassigned",
            clientNr: req.body.clientNr,
            name: req.body.name,
            thirdParty:req.body.thirdParty,
            description: req.body.description,
            urlRoute: req.body.urlRoute,
            resourcePath: req.body.resourcePath,
            headers: req.body.headers,
            method: req.body.method,
            requestBody: req.body.requestBody,
            requestBodyType: req.body.requestBodyType,
            responseBodyType: req.body.responseBodyType,
            parametersDescription: req.body.parametersDescription
         });
         const api = await newApi.save();
         res.status(200).json(api);
      }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });


 router.post("/copy", async (request, res) => {
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
 

   if (!req.body.apiToCopy)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"apiToCopy is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.newApiName)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"newApiName is a required field",req.body.apiPublicKey));
       return
      }    

      
       
      const myapiToCopy = await Api.findOne({ clientNr: req.body.clientNr, name: req.body.apiToCopy })
      if (!myapiToCopy)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"apiToCopy name for the api object not found. Could not copy",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      console.log(req.body);
     
      const apiToSave = {
         ...myapiToCopy.toObject(),
         _id: undefined, // Exclude the _id to ensure a new one is generated
         __v: undefined, // Also exclude the version key (__v) if present
         name: req.body.newApiName // Set the new name
      }

      console.log("API TO SAVE");
      console.log(apiToSave);

      const newApi = new Api(apiToSave);
         
         const api = await newApi.save();
         res.status(200).json(api);
      }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });


//update API
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
     
     if (!req.body.name)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
      return
     } 


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  
      const myapi = await Api.findOne({ clientNr: req.body.clientNr, name: req.body.name })
      if (!myapi)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A api object with this clientNr and name does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const api = await Api.findOneAndUpdate({ $and: [{ clientNr: req.body.clientNr }, { name: req.body.name }] }, {
    $set: req.body});
    if (!api) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The api object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"api object has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );

// change Name API
router.post("/changename", async (request, res) => {

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
        
        if (!req.body.oldName)
        {
         res.status(412).json(utils.Encryptresponse(req.encryptresponse,"oldName is a required field",req.body.apiPublicKey));
         return
        } 

        if (!req.body.newName)
        {
         res.status(412).json(utils.Encryptresponse(req.encryptresponse,"newName is a required field",req.body.apiPublicKey));
         return
        } 
   
   
        const client = await Client.findOne({ clientNr: req.body.clientNr })
        if (!client)
         {
          res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
          return
         }  
         const myapi = await Api.findOne({ clientNr: req.body.clientNr, name: req.body.oldName })
         if (!myapi)
          {
           res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A api object with this clientNr and name does not exist. Unable to update",req.body.apiPublicKey));
           return
          } 
   
   
     try {
   
      const api = await Api.findOneAndUpdate(
         { $and: [{ clientNr: req.body.clientNr }, { name: req.body.oldName }] },
         { $set: { name: req.body.newName } } // Only update the `name` field
       );
       
       if (!api) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The api object has not been updated. Not found!",req.body.apiPublicKey))}
       else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"api object has been updated.",req.body.apiPublicKey)) }
     } catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
     }
   } );
   

//delete task
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

   if (!req.body.name)
   {
   res.status(412).json(utils.Encryptresponse(req.encryptresponse,"name is a required field",req.body.apiPublicKey));
   return
   }  


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const myapi = await Api.findOne({ clientNr: req.body.clientNr, name: req.body.name })
      if (!myapi)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"An api object with this clientNr and name does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    const api = await Api.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { name: req.body.name }] });
    if (!api)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"api object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"api object has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Query one api
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
  try {
    
    const api = await Api.findOne({ clientNr: req.body.clientNr, name: req.body.name });
    if (!api) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No API object found for this clientNr and name combination",req.body.apiPublicKey))}
    else // an API was found
    { 
      // check if this is a request that could return a custom API
      
      if (req.body.custom !== undefined && req.body.custom === true )
      {
         // fetch the custom value using email and chatbotkey
         console.log("FETCHING CUSTOM API");
         console.log(req.body.userClientNr);
         const customApi = await CustomUserApi.findOne({ userClientNr: req.body.userClientNr, name: req.body.name, email:req.body.email, chatbotKey:req.body.chatbotKey });
         console.log(customApi);
         if (customApi)
         { 
            console.log("returned custom");
            res.status(200).json(customApi)
            return
         }
         else
         {
            // no custom api found
            res.status(200).json(api);
            return
         }
      }
      else
      {
         res.status(200).json(api)
         return
      } 
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
     
     const Apis = await Api.find({ clientNr: req.body.clientNr});
     if (!Apis) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No API objects found for this clientNr",req.body.apiPublicKey))}
     else {res.status(200).json(Apis) }
     }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }
 });


module.exports = router;
