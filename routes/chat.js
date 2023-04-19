const router = require("express").Router();
const Chatbot = require("../models/Chatbot");
const Chathistory = require("../models/Chathistory");
const bcrypt = require("bcrypt");
const {ChromaClient} = require('chromadb');
const {OpenAIEmbeddingFunction} = require('chromadb');
const axios = require("axios");


//ask Chat question
router.post("/ask", async (req, res) => {
  
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
      const client = new ChromaClient();
      const embedder = new OpenAIEmbeddingFunction(openaiKey);
      const collection = await client.getCollection(collectionName, embedder);
     
      const results = await collection.query(
        undefined, 
        1, 
        undefined, 
        [prompt]
      ) ;


      const chromaResult = results.documents[0][0] ;

      console.log(chromaResult);

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