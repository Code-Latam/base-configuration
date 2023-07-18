// Import node-forge
var forge = require('node-forge');

// Generate a key pair
var keypair = forge.pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});

// Export the public and private keys in PEM format
var publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
var privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

// Create a JSON object to encrypt
var data = {
  name: "Alice",
  age: 25,
  message: "Hello world"
};

// Convert the JSON object to a string
var dataString = JSON.stringify(data);

// Generate a random AES key
var aesKey = forge.random.getBytesSync(16);

// Encrypt the data using the AES key and CBC mode
var cipher = forge.cipher.createCipher('AES-CBC', aesKey);
cipher.start({iv: aesKey}); // use the same key as iv for simplicity
cipher.update(forge.util.createBuffer(dataString));
cipher.finish();
var encryptedData = cipher.output.getBytes();

// Encrypt the AES key using the public key and RSA-OAEP with MD5
var encryptedKey = keypair.publicKey.encrypt(aesKey, 'RSA-OAEP', {
  md: forge.md.md5.create(),
  mgf1: {
    md: forge.md.md5.create()
  }
});

// Encode the encrypted data and key in base64
var encryptedDataBase64 = forge.util.encode64(encryptedData);
var encryptedKeyBase64 = forge.util.encode64(encryptedKey);

// Send the encrypted data and key to the API
// You can use any method you prefer, such as HTTP request, socket, etc.
// Here we just use a simple console log
console.log("Sending encrypted data and key to API:");
console.log(encryptedDataBase64);
console.log(encryptedKeyBase64);
