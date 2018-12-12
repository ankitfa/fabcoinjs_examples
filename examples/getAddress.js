const func = require('../commonFunctions')

//replace the following mnemonics with yours to get the address 
const mnemonicsForTesting = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong' 
const account = 0 //The mobile wallet application uses only one account and thus the number is set to zero - DO NOT change this number unless you know what you are doing
const chainType = 0 //The chaintype refers to either internal(Change address) or external(receive address) type. Use 0 for external type and 1 for internal type
const addressIndex = 0 // the index of address can be in the range of 0 - 4294967295 (four billion and then some)
//For more information on how these addresses should be derived, kindly refer to the table at https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
let address = func.getAddress(mnemonicsForTesting,account,chainType,addressIndex)
console.log('Address : ',address)

