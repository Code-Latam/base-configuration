// Import the crypto module
var crypto = require('crypto');

// Create an ECDH object with the same curve as the one used to generate the keys
var alice = crypto.createECDH('prime256v1');

// Import your public and private keys from the database
// Assume they are stored as hex strings
var alicePublicKey = '02b9a8f0c0d6e5f4c9f2a3a8b7a6c0d5c4e1b2a3b4a5c6d7e8f9a0b1c2d3e4f5';
var alicePrivateKey = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2';

// Set your keys on the ECDH object
alice.setPublicKey(alicePublicKey, 'hex');
alice.setPrivateKey(alicePrivateKey, 'hex');

// Get the other party's public key from somewhere
// Assume it is also a hex string
var bobPublicKey = '03c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7';

// Compute the shared secret using your private key and the other party's public key
var aliceSecret = alice.computeSecret(bobPublicKey, 'hex', 'hex');

// Print the shared secret
console.log('Shared secret:', aliceSecret);
