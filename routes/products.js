const Client = require("../models/Client");
const Product = require("../models/Product");
const Workflow = require("../models/Workflow");
const Task = require("../models/Task");
const Link = require("../models/Link");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// register Product

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

      if (!req.body.explorerId)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.productName)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
       return
      } 

      if (!req.body.description)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"Description is a required field",req.body.apiPublicKey));
       return
      } 
 

      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
      const myproduct = await Product.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId , productName: req.body.productName })
      if (myproduct)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A product object with this productName allready exists for this client and explorer Id",req.body.apiPublicKey));
        return
       } 
 
   try 
   {
   
      const newProduct = new Product(
         {
           clientNr: req.body.clientNr,
           explorerId: req.body.explorerId,
           productName: req.body.productName,
           description: req.body.description,
         });
         const product = await newProduct.save();
         res.status(200).json(product);
      }
   
    catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });

//update Product
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

     if (!req.body.explorerId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.productName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  
      const myproduct = await Product.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, productName: req.body.productName })
      if (!myproduct)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A product object with this clientNr, explorerId and productName does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const product = await Product.findOneAndUpdate({ $and: [{ clientNr: req.body.clientNr }, { productName: req.body.productName }, { explorerId: req.body.explorerId }] }, {
    $set: req.body});
    if (!product) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The product object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Product object has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );


//delete product
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

     if (!req.body.explorerId)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.productName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
      return
     } 

   

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const myproduct = await Product.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId, productName: req.body.productName })
      if (!myproduct)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A product object with this clientNr, explorerId and productName does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    var product = await Product.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }, { productName: req.body.productName }] });
    if (!product)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Product object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Product object has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Query one product
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


     if (!req.body.productName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"productName is a required field",req.body.apiPublicKey));
      return
     } 

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const myproduct = await Product.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId ,productName: req.body.productName })
      if (!myproduct)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A Product object with this name does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const product = await Product.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId,productName: req.body.productName });
    if (!product) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No product object found for this clientNr, explorerId and productName combination",req.body.apiPublicKey))}
    else {res.status(200).json(product) }
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
   try {
     
     const products = await Product.find({ clientNr: req.body.clientNr,exploreId: req.body.explorerId});
     if (!products) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No product object found for this clientNr",req.body.apiPublicKey))}
     else {res.status(200).json(products) }
     }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }
 });


 // Get product tree
router.post("/gettree", async (request, res) => {

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
   
       try {
         const { clientNr, explorerId } = req.body; // Get clientNr and explorerId from the request body
     
         // Query the 'products' and 'workflow' collections based on clientNr and explorerId
         const products = await Product.find({ clientNr, explorerId });
         const workflows = await Workflow.find({ clientNr, explorerId });
     
         // Create an object to map product names to their workflows
         const productWorkflowsMap = {};
     
         // Populate the productWorkflowsMap
         products.forEach((product) => {
           productWorkflowsMap[product.productName] = [];
         });
     
         workflows.forEach((workflow) => {
           if (productWorkflowsMap[workflow.productName]) {
             productWorkflowsMap[workflow.productName].push(workflow.name);
           }
         });
     
         // Convert the productWorkflowsMap to an array of objects
         const result = Object.entries(productWorkflowsMap).map(([name, workflows]) => {
           return { name, workflows };
         });
     
         // Send the formatted data as a JSON response
         res.json(result);
       } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Internal Server Error' });
       }



 });


module.exports = router;
