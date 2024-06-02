const Client = require("../models/Client");
const Task = require("../models/Task");
const Api = require("../models/Api");
const Link = require("../models/Link");
const CustomUserApiResult = require("../models/CustomUserApiResult");
const utils = require("../utils/utils.js");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// register Task

router.post("/register", async (request, res) => {

   console.log("IN LINKS");
   const req = await utils.getDecodedBody(request);

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

   if (!req.body.explorerId)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
       return
      } 
   if (!req.body.workflowName)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
       return
      } 
  
      if (!req.body.links)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"links is a required object field",req.body.apiPublicKey));
       return
      } 

      
      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
       
      
       // const mylink = await Link.findOne({ clientNr: req.body.clientNr,explorerId: req.body.explorerId , workflowName:req.body.workflowName })
       const mylink = null;
      

      if (mylink)
       {
       
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A link object with this clientNr, explorer Id and workflowName allready exists",req.body.apiPublicKey));
        return
       } 
      
   try 
   {

   
      const newLink = new Link(
         {
           clientNr: req.body.clientNr,
           explorerId: req.body.explorerId,
           workflowName:req.body.workflowName,
           links: req.body.links,
         });
         const link = await newLink.save();
         res.status(200).json(link);
      }
   
    catch (err) {
      console.log(err.message);
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An Internal Server error ocurred",req.body.apiPublicKey));
     }
   
 });

//update link
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

     if (!req.body.workflowName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      }  
      const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName: req.body.workflowName})
      if (!mylink)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"A link object with this clientNr, explorerId, workflowName does not exist. Unable to update",req.body.apiPublicKey));
        return
       } 


  try {

    const link = await Link.findOneAndUpdate({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId }, { workflowName: req.body.workflowName }] }, {
    $set: req.body});
    if (!link) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"The link object has not been updated. Not found!",req.body.apiPublicKey))}
    else { res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Link object has been updated.",req.body.apiPublicKey)) }
  } catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey));
  }
} );


//delete link
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

     if (!req.body.workflowName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 

   

     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId, workflowName:req.body.workflowName  })
      if (!mylink)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"An link object with this clientNr, explorerId, workflowName does not exist. Unable to delete",req.body.apiPublicKey));
        return
       } 
      
   try {
    var link = await Link.findOneAndDelete({ $and: [{ clientNr: req.body.clientNr }, { explorerId: req.body.explorerId },{workflowName:req.body.workflowName}] });
    if (!link)
    {
    res.status(404).json(utils.Encryptresponse(req.encryptresponse,"Link object not found and not deleted",req.body.apiPublicKey));
    }
    else
    {
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,"Link object has been deleted",req.body.apiPublicKey));
    }
   }
  catch (err) {
    res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
    }
});

// Query one workflow for its links
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

     if (!req.body.workflowName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId ,workflowName: req.body.workflowName })
      if (!mylink)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A link object with this workfloName does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const links = await Link.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName:req.body.workflowName });
    if (!links) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No link object found for this clientNr, explorerId and workflowName combination",req.body.apiPublicKey))}
    else {res.status(200).json(links) }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});

router.post("/querysourcesandtargets", async (request, res) => {

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

     if (!req.body.workflowName)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId ,workflowName: req.body.workflowName })
      if (!mylink)
       {
        res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A link object with this workfloName does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {
    
    const link = await Link.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName:req.body.workflowName });
    if (!link) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No link object found for this clientNr, explorerId and workflowName combination",req.body.apiPublicKey))}
    else 
    {
      const linksList = link.links
      // now construct an array of sources and of targets
      
      const sources = [];
      const targets = [];

      linksList.forEach(obj => {
      sources.push(obj.source);
      targets.push(obj.target);
      });

      res.status(200).json({sources: sources, targets: targets}) 
    }
    }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
});

// Query one workflow for all of its links, get all the apis
router.post("/queryorderedapi", async (request, res) => {

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
 
      if (!req.body.workflowName)
      {
       res.status(412).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
       return
      } 
 
 
      const client = await Client.findOne({ clientNr: req.body.clientNr })
      if (!client)
       {
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
        return
       } 
      const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId ,workflowName: req.body.workflowName })
       if (!mylink)
        {
         res.status(404).json(utils.Encryptresponse(req.encryptresponse,"A link object with this workfloName does not exist. Unable to fetch",req.body.apiPublicKey));
         return
        } 
   try {
     
     const link = await Link.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName:req.body.workflowName });
     if (!link) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No link object found for this clientNr, explorerId and workflowName combination",req.body.apiPublicKey))}
     else 
     
     {
      // first order the tasks in an array
      const taskNames = findOrder(link);
      console.log("TAKNAMES");
      console.log(taskNames);
      // Now make an array of the assoicated api names
      const apiNamesArray = [];
      for (const taskName of taskNames) {
         const taskData = await Task.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId, taskId:taskName, workflowName:req.body.workflowName })
         if (taskData) {
           apiNamesArray.push({taskId: taskData.taskId, apiName: taskData.apiName});
         }
       }
       console.log("APIS NAME ARRAY",apiNamesArray )

       const apiObjectsArray = [];

       for (const item of apiNamesArray) {
         if (item.apiName === "") {
           apiObjectsArray.push({});
         } else {
           const apiData = await Api.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, name: item.apiName });
           if (apiData) {
             apiObjectsArray.push({taskId:item.taskId, api:apiData });
           }
         }
       }
       console.log("API OBJECTS ARRAY", apiObjectsArray)

      res.status(200).json(utils.Encryptresponse(req.encryptresponse,apiObjectsArray,req.body.apiPublicKey)) 
     }
   }
     catch (err) {
       res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
   }




   function findOrder(link) {
      // Create a map to store the tasks and their dependencies
      const taskMap = new Map();
      
      // Populate the taskMap with tasks and their dependencies
      for (const linkObj of link.links) {
          const source = linkObj.source;
          const target = linkObj.target;
          
          if (!taskMap.has(source)) {
              taskMap.set(source, { task: source, dependencies: [] });
          }
          
          if (!taskMap.has(target)) {
              taskMap.set(target, { task: target, dependencies: [] });
          }
          
          taskMap.get(target).dependencies.push(source);
      }
      
      const result = [];
      const visited = new Set();
      const visiting = new Set();
      let hasCycle = false;
      
      function visit(task) {
          if (visiting.has(task)) {
              hasCycle = true;
          }
          if (!visited.has(task) && !hasCycle) {
              visiting.add(task);
              for (const dependency of taskMap.get(task).dependencies) {
                  visit(dependency);
              }
              visiting.delete(task);
              visited.add(task);
              result.push(task);
          }
      }
      
      for (const task of taskMap.keys()) {
          visit(task);
      }
      
      if (hasCycle) {
          return "Cycle detected, cannot determine order.";
      } else {
          return result;
      }
  }
  
  

 });


 router.post("/querylinkparameters", async (request, res) => {

  // this API will return an object with 3 properties
  // a constructed Path Parameter (string)
  // a cosntructed Query Parameter (string)
  // a request body object (object)

 // validate requestbody 
  const req = await utils.getDecodedBody(request);
  console.log("IN API QUERYLINKPARAMETERS",req.body );

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
      res.status(408).json(utils.Encryptresponse(req.encryptresponse,"ClientNr is a required field",req.body.apiPublicKey));
      return
     }  

     if (!req.body.explorerId)
     {
      res.status(409).json(utils.Encryptresponse(req.encryptresponse,"explorerId is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.workflowName)
     {
      res.status(410).json(utils.Encryptresponse(req.encryptresponse,"workflowName is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.taskId)
     {
      res.status(411).json(utils.Encryptresponse(req.encryptresponse,"taskId is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.email)
     {
      res.status(411).json(utils.Encryptresponse(req.encryptresponse,"email is a required field",req.body.apiPublicKey));
      return
     } 

     if (!req.body.chatbotKey)
     {
      res.status(411).json(utils.Encryptresponse(req.encryptresponse,"chatbotKey is a required field",req.body.apiPublicKey));
      return
     } 


     if (!req.body.baseUrl)
     {
      res.status(412).json(utils.Encryptresponse(req.encryptresponse,"baseurl is a required field",req.body.apiPublicKey));
      return
     } 


     const client = await Client.findOne({ clientNr: req.body.clientNr })
     if (!client)
      {
       res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
       return
      } 
     const mylink = await Link.findOne({ clientNr: req.body.clientNr, explorerId:req.body.explorerId , workflowName: req.body.workflowName })
      if (!mylink)
       {
        res.status(406).json(utils.Encryptresponse(req.encryptresponse,"A link object with this workflowName does not exist. Unable to fetch",req.body.apiPublicKey));
        return
       } 
  try {

    // make a list for all the links that has that taskId as the target
    
    const workflowLinkObject = await Link.findOne({ clientNr: req.body.clientNr, explorerId: req.body.explorerId, workflowName:req.body.workflowName });
    if (!workflowLinkObject) {res.status(404).json(utils.Encryptresponse(req.encryptresponse,"No link object found for this clientNr, explorerId and workflowName combination",req.body.apiPublicKey))}
    else    
    {
      const allLinksArray = workflowLinkObject.links;
      const linkswithIndicatedTarget = allLinksArray
            .filter(obj => obj.target === req.body.taskId && obj.passLinkParameters === true)
            .sort((a, b) => {
              // Get the sequence values, treating undefined as 1
              const seqA = a.sequence !== undefined ? a.sequence : 1;
              const seqB = b.sequence !== undefined ? b.sequence : 1;

              // Compare the sequence values for sorting
              return seqA - seqB;
            });
    
    if (linkswithIndicatedTarget.length == 0)
    {
      // no active links found
      // return not found and empty objects

      const myEmptyReturnObject =
     {
      activeLinks: false ,
      path: "",
      requestBody: {}
     } 

     res.status(200).json(utils.Encryptresponse(req.encryptresponse,myEmptyReturnObject,req.body.apiPublicKey)) 
     return;
    }

     // first construct path parameters
     console.log("All LINKS ARRAY",allLinksArray); 
     console.log("All LINKS WITH TARGET ARRAY",linkswithIndicatedTarget); 
     var completePath
     const baseURL =  req.body.baseUrl;
     const completePathParameters = await constructCompletePathParameters(req.body, linkswithIndicatedTarget, baseURL);
     const completeQueryParameters = await constructCompleteQueryParameters(req.body, linkswithIndicatedTarget);
     if (!completeQueryParameters)
     {
      completePath = completePathParameters
     }
     else
     {
      completePath = completePathParameters + "?" + completeQueryParameters;
     }

     const completeRequestBody = await constructCompleteRequestBody(req.body, linkswithIndicatedTarget);

     const myReturnObject =
     {
      activeLinks: true ,
      path: completePath,
      requestBody: completeRequestBody
     } 

     res.status(200).json(utils.Encryptresponse(req.encryptresponse,myReturnObject,req.body.apiPublicKey)) 
     return;
    }

    
  }
    catch (err) {
      res.status(500).json(utils.Encryptresponse(req.encryptresponse,"An internal server error ocurred. Please check your fields",req.body.apiPublicKey))
  }
 
});

async function constructCompletePathParameters(requestBody,filteredArray, baseURL) {
  // Map each object to a promise that resolves to the path parameter string
  console.log("IN COSTRUCT COMPLETE PATH");
  const promises = filteredArray.map(async obj => {
    return await convertToPathParameters(requestBody, obj.source, obj.pathParameters, obj.pathOrder);
  });

  // Wait for all promises to resolve
  const results = await Promise.all(promises);

  // Concatenate the results with '/'
  const completePath = results.join('/');

  // Combine the baseURL with the complete path
  return `${baseURL}/${completePath}`;
}

async function constructCompleteQueryParameters(requestBody,filteredArray) {
  // Map each object to a promise that resolves to the path parameter string
  console.log("IN COSTRUCT COMPLETE Query PARAMETER");
  const promises = filteredArray.map(async obj => {
    return await convertToQueryParameters(requestBody, obj.source, obj.queryParameters);
  });

  // Wait for all promises to resolve
  const results = await Promise.all(promises);

  // Concatenate the results with '/'
  const completeQueryParameters = results.join('&');

  // Combine the baseURL with the complete path
  return `${completeQueryParameters}`;
}

async function constructCompleteRequestBody(requestBody,filteredArray) {
  // Map each object to a promise that resolves to the path parameter string
  console.log("IN CONSTRUCT COMPLETE REQUEST BODY PARAMETER");
  const promises = filteredArray.map(async obj => {
    return await convertToRequestBodyParameters(requestBody, obj.source, obj.requestbodyParameters);
  });

  console.log("Hello");

  // Wait for all promises to resolve
  const results = await Promise.all(promises);

  console.log("RESULTS", results);

 // merge objects
  const completeRequestBodyParameters = mergeObjects(results);

  // Combine the baseURL with the complete path
  return completeRequestBodyParameters;
}

function mergeObjects(objectsArray) {
  return objectsArray.reduce((accumulator, currentObject) => {
    return { ...accumulator, ...currentObject };
  }, {});
}

async function convertToPathParameters(requestBody,sourceId, pathParameters, pathOrder) {
  console.log("PATH PARAMETERS", pathParameters);
  if (!pathParameters || Object.keys(pathParameters).length === 0) {
    return '';
  }

  let updatedPathParameters ;
  const apiName = await getApiName(requestBody, sourceId ) ;
  console.log("API NAME", apiName)
  if (apiName)
  {
    const previousApiResult = await getPreviousApiResult(requestBody, apiName); 
    if (previousApiResult)
    {
      updatedPathParameters = replaceParameters(previousApiResult, pathParameters )
    }
  }
  else
  {
    // no api associated with this sourceid 

    updatedPathParameters = pathParameters;
  }


  let paramsArray;

  if (pathOrder && pathOrder.length > 0) {
    // Create an array of values based on the order specified in pathOrder
    paramsArray = pathOrder.map(key => encodeURIComponent(updatedPathParameters[key]));
  } else {
    // Create an array of values from pathParameters in any order
    paramsArray = Object.values(updatedPathParameters).map(value => encodeURIComponent(value));
  }

  return paramsArray.join('/');
}


async function convertToQueryParameters(requestBody,sourceId, queryParameters) {
  console.log("QUERY PARAMETERS", queryParameters);
  if (!queryParameters || Object.keys(queryParameters).length === 0) {
    return '';
  }

  var updatedQueryParameters ;
  const apiName = await getApiName(requestBody, sourceId ) ;
  console.log("API NAME", apiName)
  if (apiName)
  {
    const previousApiResult = await getPreviousApiResult(requestBody, apiName); 
    if (previousApiResult)
    {
      updatedQueryParameters = replaceParameters(previousApiResult, queryParameters )
    }
  }
  else
  {
    // no api associated with this sourceid 

    updatedQueryParameters = queryParameters;
  }


 const queryParametersString = constructQueryParams(updatedQueryParameters);

  return queryParametersString;
}

async function convertToRequestBodyParameters(requestBody,sourceId, requestBodyParameters) {
  console.log("REQUESTBODY PARAMETERS", requestBodyParameters);
  if (!requestBodyParameters || Object.keys(requestBodyParameters).length === 0) {
    return {};
  }

  var updatedRequestBodyParameters ;
  const apiName = await getApiName(requestBody, sourceId ) ;
  console.log("API NAME", apiName)
  if (apiName)
  {
    const previousApiResult = await getPreviousApiResult(requestBody, apiName); 
    if (previousApiResult)
    {
      updatedRequestBodyParameters = replaceParameters(previousApiResult, requestBodyParameters )
    }
  }
  else
  {
    // no api associated with this sourceid 

    updatedRequestBodyParameters = requestBodyParameters;
  }

  return updatedRequestBodyParameters;
}

function constructQueryParams(queryParams) {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    return '';
  }

  // Create an array to hold the key=value pairs
  const paramsArray = [];

  // Iterate over the entries in the queryParams object
  for (const [key, value] of Object.entries(queryParams)) {
    if (Array.isArray(value)) {
      // If the value is an array, create key=value pairs for each element
      value.forEach(val => {
        paramsArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
      });
    } else {
      // Otherwise, create a key=value pair for the single value
      paramsArray.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
  }

  // Join the array with '&' to form the query string
  return paramsArray.join('&');
}

async function getApiName(requestBody, sourceId)
{
  console.log("In GETAPINAME");
  try {
    const taskResponse = await Task.findOne({
      clientNr: requestBody.clientNr,
      explorerId: requestBody.explorerId,
      workflowName: requestBody.workflowName, 
      taskId: sourceId
    });
    var returnResult;
    if (taskResponse.apiName === null || taskResponse.apiName === undefined || taskResponse.apiName === '') {
      returnResult = "";
    } 
    else
    {
      returnResult = taskResponse.apiName
    }
  } catch (error) 
  {
    console.log("error", error)
    returnResult = "";
  }

  return returnResult
}

async function getPreviousApiResult(requestBody, apiName)
{
  try {
    const apiResponse = await CustomUserApiResult.findOne({
      clientNr: requestBody.clientNr,
      explorerId: requestBody.explorerId,
      chatbotKey: requestBody.chatbotKey, 
      email: requestBody.email,
      name: apiName
    });
    var returnResult;
    if (apiResponse === null || apiResponse === undefined ) {
      returnResult = {};
    } 
    else
    {
      returnResult = apiResponse.result
    }
  } catch (error) 
  {
    returnResult = {};
  }

  return returnResult
}


function replaceParameters(mixedObject, Parameters) {
  const result = { ...Parameters }; // Create a copy of pathParameters to modify

  Object.keys(result).forEach(key => {
    const value = result[key];
    if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
      // Extract the property name inside the {{ }}
      const propName = value.slice(2, -2).trim();
      
      // Find the value of the property in mixedObject
      const replacementValue = getValueFromObject(mixedObject, propName);

      if (replacementValue !== undefined) {
        result[key] = replacementValue;
      }
    }
  });

  return result;
}

// Helper function to recursively find a property in a nested object
function getValueFromObject(obj, propName) {
  if (obj.hasOwnProperty(propName)) {
    return obj[propName];
  }

  for (let key in obj) {
    if (obj[key] !== null && typeof obj[key] === 'object') {
      const result = getValueFromObject(obj[key], propName);
      if (result !== undefined) {
        return result;
      }
    }
  }
  
  return undefined;
}


module.exports = router;
