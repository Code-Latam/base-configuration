// Import node-forge
var forge = require('node-forge');

// Receive the encrypted data and key from the consumer
// You can use any method you prefer, such as HTTP request, socket, etc.
// Here we just use a simple console log
console.log("Receiving encrypted data and key from consumer:");
var encryptedDataBase64 = "Z9oY2nQxkZw1c7g7y9l4JXjOaLzq3yq1V0m4F6wvK3iYsT+4Mg8lWQy0GJ6L4h0wZt2nKvCp6oX+V8cDmN+T8z9XrHsUkYhRbQjyfOgDlWu7aHf9eTqGtRnFVYjJUfXaZ2LpMwE4Y0hU7rW1bBdN3rQOvIv3eBxqk6m2F8iCnKlBb1N6kRdFjzLcQ2t5zCpMl9uJ0QDmSd7s+o3WfGyEiQcH7a+Gxu/8ZxXzYsOZuSbVrXbFgI0Bqo6j9RnK3iKpIwNnWfZa7tGyvJmVdUe4lRkEoE2H9wJg1cL5WtDqyHhNtMvL2XbT2jOvT+1gIhBkRQs5a6MzPqUxSdYw==";
var encryptedKeyBase64 = "Z9oY2nQxkZw1c7g7y9l4JXjOaLzq3yq1V0m4F6wvK3iYsT+4Mg8lWQy0GJ6L4h0wZt2nKvCp6oX+V8cDmN+T8z9XrHsUkYhRbQjyfOgDlWu7aHf9eTqGtRnFVYjJUfXaZ2LpMwE4Y0hU7rW1bBdN3rQOvIv3eBxqk6m2F8iCnKlBb1N6kRdFjzLcQ2t5zCpMl9uJ0QDmSd7s+o3WfGyEiQcH7a+Gxu/8ZxXzYsOZuSbVrXbFgI0Bqo6j9RnK3iKpIwNnWfZa7tGyvJmVdUe4lRkEoE2H9wJg1cL5WtDqyHhNtMvL2XbT2jOvT+1gIhBkRQs5a6MzPqUxSdYw==";

// Decode the encrypted data and key from base64
var encryptedData = forge.util.decode64(encryptedDataBase64);
var encryptedKey = forge.util.decode64(encryptedKeyBase64);

// Import the private key in PEM format
var privateKeyPem = "-----BEGIN RSA PRIVATE KEY-----\n" +
"MIIEowIBAAKCAQEAti8eCp6fYr9cLJmG3F7/4uE0p/0sKZrHxM1eIgC+8Tm7iA4+\n" +
"... (omitted for brevity) ...\n" +
"-----END RSA PRIVATE KEY-----\n";

// Create a private key object from the PEM string
var privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

// Decrypt the AES key using the private key and RSA-OAEP with MD5
var aesKey = privateKey.decrypt(encryptedKey, 'RSA-OAEP', {
  md: forge.md.md5.create(),
  mgf1: {
    md: forge.md.md5.create()
  }
});

// Decrypt the data using the AES key and CBC mode
var decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
decipher.start({iv: aesKey}); // use the same key as iv for simplicity
decipher.update(forge.util.createBuffer(encryptedData));
decipher.finish();
var decryptedData = decipher.output.getBytes();

// Convert the decrypted data to a JSON object
var data = JSON.parse(decryptedData);

// Do something with the data
console.log("Decrypted data:");
console.log(data);
