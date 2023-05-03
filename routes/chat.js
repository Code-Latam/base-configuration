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
router.post("/ask", async (req, res) => {

  const CHROMA_URL = process.env.CHROMA_URL ;

  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
{
  res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
      return
}

  const client = await Client.findOne({ clientNr: req.body.clientNr })
  if (!client)
   {
    res.status(401).json("client number does not exist");
    return
   }  

  
try {
    //create new entry in chat history using chathistory model
    const callerchatbot = await Chatbot.findOne({ chatbotKey: req.body.chatbotKey })
    if (!callerchatbot)
     {res.status(401).json("caller has no rights to asks questions")}
    else
    {
      // get prompt and chatbotKey from body
      const {prompt,chatbotKey} = req.body
      // get prompt template and openAiKey and collection name
      const chatbot = await Chatbot.findOne({ chatbotKey: chatbotKey })
      const {promptTemplate,openaiKey} = chatbot;
      const collectionName = chatbot.name;
      console.log(openaiKey)

      

      // get answer from Chroma
      const client = new ChromaClient(CHROMA_URL);
      console.log("after creatingg Chroma");
      const embedder = new OpenAIEmbeddingFunction(openaiKey);
      console.log("after calling embedding function")
    
        const collection = await client.getCollection(collectionName, embedder);
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

      // get answer from chatgpt

      const response = await axios({
        method: "post",
        url: "https://api.openai.com/v1/engines/text-davinci-003/completions",
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

      res.status(200).json(chatgptAnswer);
    }
    } 
    catch (err) {
      res.status(500).json(err)
    }
});

// Get all chat for a chatbot in a certain period
router.post("/queryperiod", async (req, res) => {

  if (!utils.gwokenCorrect(req.body, req.body.gwoken))
{
  res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
      return
}
  const client = await Client.findOne({ clientNr: req.body.clientNr })
  if (!client)
   {
    res.status(401).json("client number does not exist");
    return
   }  
    try {
      if (req.body.chatRequestResult === "ALL")
      {
      const chathistory = await Chathistory.find({
        timestamp: {
          $gte: req.body.start,
          $lte: req.body.end
        },
        chatbotKey: req.body.chatbotKey
      });
      if (chathistory.length === 0) {res.status(404).json("No chat history found for this chatbot")}
      else {res.status(200).json(chathistory) }
      }
      else
      {
        const chathistory = await Chathistory.find({
            timestamp: {
              $gte: req.body.start,
              $lte: req.body.end
            },
            chatbotKey: req.body.chatbotKey,
            chatRequestResult: req.body.chatRequestResult
          });
          if (chathistory.length === 0) {res.status(404).json("No chat history found for this chatbot")}
          else {res.status(200).json(chathistory) }
      }
      
      }
      catch (err) {
      res.status(500).json(err);
    }
  });

// Count all chat for a chatbot in a certain period
  router.post("/queryperiodcount", async (req, res) => {

    if (!utils.gwokenCorrect(req.body, req.body.gwoken))
    {
      res.status(401).json("gwoken verification failed. Please check you gwoken calculation.");
      return
    }
    const client = await Client.findOne({ clientNr: req.body.clientNr })
    if (!client)
     {
      res.status(401).json("client number does not exist");
      return
     }  
    try {
      if (req.body.chatRequestResult === "ALL")
      {
      const count = await Chathistory.find({
        timestamp: {
          $gte: req.body.start,
          $lte: req.body.end
        },
        chatbotKey: req.body.chatbotKey
      }).countDocuments();
      res.status(200).json(count) ;
      }
      else
      {
        const count = await Chathistory.find({
            timestamp: {
              $gte: req.body.start,
              $lte: req.body.end
            },
            chatbotKey: req.body.chatbotKey,
            chatRequestResult: req.body.chatRequestResult
          }).countDocuments();
          res.status(200).json(count) ;
      }
      
      }
      catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;