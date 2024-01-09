const router = require("express").Router();
const Client = require("../models/Client");
const Chatbot = require("../models/Chatbot");
const Chathistory = require("../models/Chathistory");
const utils = require("../utils/utils.js");
const bcrypt = require("bcrypt");
const {ChromaClient} = require('chromadb');
const {OpenAIEmbeddingFunction} = require('chromadb');
const axios = require("axios");

//ask Chat question
router.post("/ask", async (request, res) => {

  const req = await utils.getDecodedBody(request);

  const CHROMA_URL = process.env.CHROMA_URL ;

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


  const client = await Client.findOne({ clientNr: req.body.clientNr })
  if (!client)
   {
    res.status(401).json(utils.Encryptresponse(req.encryptresponse,"client number does not exist",req.body.apiPublicKey));
    return
   }  

  
try {
    //create new entry in chat history using chathistory model
    const callerchatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
    if (!callerchatbot)
     {
      res.status(401).json(utils.Encryptresponse(req.encryptresponse,"Chatbot indicated by chatbot key does not exist",req.body.apiPublicKey));
      return
    }
    else
    {
      // get prompt and chatbotKey from body
      const {prompt,chatbotKey} = req.body
      // get prompt template and openAiKey and collection name
      const chatbot = await Chatbot.findOne({ chatbotKey: chatbotKey })
      const {promptTemplate,openaiKey} = chatbot;
      const collectionName = chatbot.name;
      const validaikey = await utils.validopenai(chatbot.openaiKey)
      if (!validaikey)
      { 
        res.status(401).json(utils.Encryptresponse(req.encryptresponse,"OpenAI Key is not valid or working. Please update your chatbot with a valid OpenAI key.",req.body.apiPublicKey));
        return
      }

      

      // get answer from Chroma
      const client = new ChromaClient(CHROMA_URL);
      console.log("after creatingg Chroma");
      const embedder = new OpenAIEmbeddingFunction(openaiKey);
      console.log("after calling embedding function")
    
        const collection = await client.getCollection(collectionName, embedder);
        console.log("after calling get collection");
        const results = await collection.query(
          undefined, 
          1, 
          undefined, 
          [prompt]
        ) ;
        console.log("We got out");
        console.log(results);
        chromaResult = results.documents[0][0];
       
      

      // Merge prompt template with result of chroma and the prompt

      const newText = promptTemplate.replace('{context}', chromaResult);
      const mynewprompt = newText.replace('{question}', prompt);

      // get answer from chatgpt GPT TURBO MODEL. THe best there is.

      const response = await axios({
        method: "post",
        url: "https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        data: {
          prompt: mynewprompt,
          max_tokens: 1000,
          n: 1,
          stop: "",
          temperature: 0.5,
        },
      });

      //Process answer

      const chatgptAnswer = response.data.choices[0].text;


      // save to chat history
      const newChathistory = new Chathistory({
      chatbotKey: req.body.chatbotKey,
      prompt:  req.body.prompt,
      answer:  chatgptAnswer
      });
  
      //save cand respond
      const chathistoryItem = await newChathistory.save();
      res.status(200).json(utils.Encryptresponse(req.encryptresponse,chatgptAnswer,req.body.apiPublicKey));
        
    }
    } 
    catch (err) {
      res.status(404).json(utils.Encryptresponse(req.encryptresponse,"An unspecified error occurred",req.body.apiPublicKey));
        
    }
});

module.exports = router;