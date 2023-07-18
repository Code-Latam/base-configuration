const forge = require('node-forge');

var rsa = forge.pki.rsa;

var keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});


var json = {name: "Alice", age: 25};

var string = JSON.stringify(json);

var encrypted = keypair.publicKey.encrypt(string);

var mypublicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
console.log(mypublicKeyPem);

var myprivateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
console.log(myprivateKeyPem);

// console.log("Encrypted:")
// console.log(encrypted);

var decrypted = keypair.privateKey.decrypt(encrypted);
var json = JSON.parse(decrypted);
// console.log("Decrypted:");
// console.log(json);