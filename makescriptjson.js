var fs = require('fs');

// Read the JavaScript file
var script = fs.readFileSync("elliptic-browser.js", 'utf8');

// Convert the script to a JSON string
var json = JSON.stringify(script);

// Copy and paste the json value into the environment variable value field in Postman
fs.writeFileSync('output.json', json);