# Examples for fabcoinjs
This repository contains some examples that uses [fabcoinjs](https://www.npmjs.com/package/fabcoinjs) to interact with our Blockchain. 

## Can I use the functions available with examples?
Feel free to use the code and library for developing your own applications. However, please be aware that the functions may contain bugs. You are more then welcome to report an issue if you find one.

## Prerequisites
[node.js](https://nodejs.org/en/) & npm (which should be installed automatically with node.js) must be installed on your computer to use these examples.
After downloading this repo, kindly run `npm install` to install all the required node modules including fabcoinjs.
The examples can then be executed simply by using the node command i.e. `node examples/checkBalance.js`. 

## Available Examples
Following examples are currently avilable. We will continue to add more examples. If you have a specific request, feel free to open an issue.

|Example File|Description|
|:----------:|:-----------|
|[checkApiStatus.js](examples/checkApiStatus.js) |To check if the API is currently working as expected or not.|
|[checkBalance.js](examples/checkBalance.js) |To Check fabcoin balance associated with the supplied mnemonics. The user should replace the mnemonics in the file with their own if they wish to check their balance|
|[getAddress.js](examples/getAddress.js)|To get address for the given set of mnemonics and other configurations. The user should replace the mnemonics in the file with their own and supply other relevant arguments. |
|[getUtxo.js](examples/getUtxo.js)|To get the UTXOs for the given mnemonics. The user should replace the mnemonics in the file with their own to get the associated UTXOs.|
|[transactionInfo.js](examples/transactionInfo.js)|To get the raw transaction in JSON format for the given valid transaction ID|
