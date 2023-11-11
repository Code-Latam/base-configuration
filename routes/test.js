const User = require("../models/User");

router.post('/api/users/query', async (req, res) => {
    
      // Retrieve the query parameter from the request
      const queryParam = req.body.queryParam;
  
      // Use the findOne function to search for a specific document
      const result = await User.find({ name: queryParam });
      if (result.auth == "NONE")
      {
        res.status(404).json({ message: 'Not allowed to query this user' });
      }
      if (result) {
        res.status(200).json(result); // Return the found document as JSON
      } else {
        res.status(404).json({ message: 'User not found' });
      }
  });

  module.exports = router;