const func = require('../commonFunctions')
const apiEndPoint = 'http://fabexplorer.com'

//replace the following mnemonics with yours to check your balance 
const mnemonicsForTesting = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong' 


func.getBalanceForMnemonics(mnemonicsForTesting,apiEndPoint).then( res => {
    console.log("Balance : "+res) 
})
