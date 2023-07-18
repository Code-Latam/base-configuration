var EC = require('elliptic').ec;

// Create and initialize EC context
var ec = new EC('secp256k1');

// Generate keys
var key = ec.genKeyPair();

// Get public key
var publicKey = key.getPublic();

// Print private key in hex format
console.log(key.getPrivate().toString(16));

// Print public key in hex format
console.log(key.getPublic().encode('hex'));