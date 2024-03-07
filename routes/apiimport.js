const Client = require("../models/Client");
const Folder = require("../models/Folder");
const Workflow = require("../models/Workflow");
const Explorer = require("../models/Explorer");
const Api = require("../models/Api");
const utils = require("../utils/utils.js");
const folderutils = require("../utils/folderutils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

const axios = require('axios'); // Include axios for making HTTP requests
const fs = require('fs').promises; 

const SwaggerParser = require('swagger-parser');
const yaml = require('js-yaml');

const processItems = async (items,clientNr,explorerId, collectionName) => {
   for (const item of items) {
     if (item.item) { // This is a folder
       await processItems(item.item, clientNr,explorerId); // Recursively process the items in the folder
     } else { // This is a request
       // Map the POSTMAN data to your ApiSchema

       
       console.log("ITEM");
       console.log(item);
       const apiData = {
         collectionTag: collectionName,
         clientNr: clientNr, 
         name: item.name, // ok
         description: item.request.description || 'none', // ok
         urlRoute: item.request.url.raw, // ok
         headers: item.request.header.map(header => header.key + ': ' + header.value), // ok
         method: item.request.method, // ok
         requestBody: item.request.body && item.request.body.raw !== "" ? JSON.parse(item.request.body.raw) : {},   
         //requestBody: item.request.body ? JSON.parse(item.request.body.raw) : {},
         requestBodyType: item.request.body ? item.request.body.mode : 'none',
         responseBodyType: 'JSON', // Define how you want to set this
         parametersDescription: {}, // Define how you want to set this
       };
 


       // Create a new Api document
       const query = { name: item.name, clientNr:clientNr };
       const options = { upsert: true, new: true, setDefaultsOnInsert: true };
       await Api.findOneAndUpdate(query, apiData, options);

       // update folders:

       updateFolderStructure(clientNr, apiData.name)

     }
   }
 };

async function updateFolderStructure(clientNr, apiName)

{
   // get the folder structure:
   try
   {
      console.log("WE ARE IN")
      const query = { clientNr:clientNr };
      console.log(`CLIENT NR:`);
      console.log(query);
      console.log(`APINAME: ${apiName}`);
      
      const clientFolders = await Folder.findOne(query);
      
      if (!clientFolders)
      {
         return
      }
      console.log(`APINAME: ${apiName}`);
      const items = clientFolders.items;
      console.log("ITEMS");
      console.log(items);
      const apifound = folderutils.findApiInFolder(apiName, items);
      console.log("APIFOUND");
      console.log(apifound);
      if (items && !apifound)
      {
         
        const newItems = folderutils.addChildToFolder(apiName, "Unassigned", items );
        console.log("NEWITEMS");
        console.log(newItems);
        if (!(Object.keys(newItems).length === 0))
        {
         console.log("We ARE UPDATING");
         await Folder.findOneAndUpdate(query, { $set: { items: newItems } });
        }

      }

   }
   catch(error)
   {
      console.log ("an error occured when updating folder structure")
   }

}

// Import POSTMAN API definition file

router.post("/postman", async (request, res) => {
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

      if (!req.body.url)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"the url location of the file is a required field",req.body.apiPublicKey));
       return
      } 

      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
 
       try {
         // Read the Postman data from a file
         console.log("URL ROUTE FOR FILE");
         console.log(req.body.url);
         const postmanDataResponse = await axios.get(req.body.url);
         const postmanData = postmanDataResponse.data;

         const collectionName = postmanData.info.name;

         // Process each item (request or folder)
         await processItems(postmanData.item, req.body.clientNr,req.body.explorerId, collectionName);
          res.status(200).json('APIs imported successfully');
       } catch (error) {
         console.error('Error importing APIs:', error);
         res.status(500).json('Error importing APIs');
       }
   
 });


 

 const processPaths = async (paths, clientNr, explorerId, collectionName) => {
   for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
         const operationId = details.operationId || utils.generateUniqueId();

         const query = { name: operationId, clientNr: clientNr };
         const apiData = {
            collectionTag: collectionName,
            clientNr: clientNr,
            name: operationId,
            description: details.description || 'none',
            urlRoute: path,
            headers: details.parameters
               ? details.parameters
                    .filter(param => param.in === 'header')
                    .map(header => header.name + ': ' + header.example || header.default || '')
               : [],
            method: method.toUpperCase(),
            requestBody: details.requestBody
            ? extractRequestBodyFromComponents(details.requestBody, clientNr)
            : {},
            requestBodyType: details.requestBody ? 'json' : 'none',
            responseBodyType: 'JSON',
            parametersDescription: {}, // Adjust this based on your needs
         };

         // Create a new Api document
         const options = { upsert: true, new: true, setDefaultsOnInsert: true };
         await Api.findOneAndUpdate(query, apiData, options);
      }
   }
};



router.post("/openapi", async (request, res) => {

   const processPaths = async (paths, clientNr, explorerId, collectionName) => {
      for (const [path, methods] of Object.entries(paths)) {
         for (const [method, details] of Object.entries(methods)) {
            const operationId = details.operationId || utils.generateUniqueId();
   
            const query = { name: operationId, clientNr: clientNr };
            const apiData = {
               collectionTag: collectionName,
               clientNr: clientNr,
               name: operationId,
               description: details.description || 'none',
               urlRoute: path,
               headers: details.parameters
                  ? details.parameters
                       .filter(param => param.in === 'header')
                       .map(header => header.name + ': ' + header.example || header.default || '')
                  : [],
               method: method.toUpperCase(),
               requestBody: details.requestBody
               ? extractRequestBodyFromComponents(details.requestBody, clientNr)
               : {},
               requestBodyType: details.requestBody ? 'json' : 'none',
               responseBodyType: 'JSON',
               parametersDescription: {}, // Adjust this based on your needs
            };
   
            // Create a new Api document
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };
            await Api.findOneAndUpdate(query, apiData, options);

            updateFolderStructure(clientNr, apiData.name)
         }
      }
   };

   const extractRequestBodyFromComponents = (requestBody, clientNr) => {
      const schema = requestBody.content['application/json'].schema;
      const examples = requestBody.content['application/json'].examples;
   
      console.log("REQUEST BODY SCHEMA");
      console.log(schema);
      console.log("REQUEST BODY EXAMPLES");
      console.log(examples);
   
      if (examples) {
         // Choose the first example (you may adjust this logic based on your needs)
         const example = examples[Object.keys(examples)[0]].value;
         return example || {};
      }
   
      if (schema && schema.properties) {
         const extractedValues = {};
   
         Object.entries(schema.properties).forEach(([propertyName, propertyDetails]) => {
            extractedValues[propertyName] = propertyDetails.default || null;
         });
   
         console.log("RETURNED OBJECT");
         console.log(extractedValues);
         return extractedValues;
      }
   
      return {};
   };





   const req = await utils.getDecodedBody(request);

   // Add your authentication checks here

   if (!req.body.clientNr || !req.body.url) {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse, "ClientNr and URL are required fields", req.body.apiPublicKey));
      return;
   }

   const client = await Client.findOne({ clientNr: req.body.clientNr });
   if (!client) {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse, "Client number does not exist", req.body.apiPublicKey));
      return;
   }

   try {
      // Read the OpenAPI Swagger data from a file
      const openApiDataResponse = await axios.get(req.body.url);
      const openApiData = yaml.load(openApiDataResponse.data);

      const collectionName = openApiData.info.title;

      // Validate the OpenAPI Swagger file
      await SwaggerParser.validate(openApiData);

      // Process each path and operation
      await processPaths(openApiData.paths, req.body.clientNr, req.body.explorerId, collectionName);

      res.status(200).json('APIs imported successfully');
   } catch (error) {
      console.error('Error importing APIs:', error);
      res.status(500).json('Error importing APIs');
   }
});

module.exports = router;



module.exports = router;
