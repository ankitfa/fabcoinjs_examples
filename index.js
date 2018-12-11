const func = require('./commonFunctions')
const apiEndPoint = 'http://fabexplorer.com'
const mnemonicsForTesting = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong'
const transactionID = 'f15365693b269f650b2042bc7b22ac70c0ec24889ba6fee7d7e40d18a3716d7b'

async function test() {
    let apiStatus =  await func.checkAPIStatus(apiEndPoint)
    console.log("API Status : "+ ((apiStatus) ? "API Ok" : "API Broken"))
    if(!apiStatus) {
        console.log("The API is currently down. Please try again after some time.")
        return
    } 

    //This function can be called to get the number of confirmations for the given transactions
    let confirmations = await func.getTransactionConfirmations(transactionID)
    console.log('Confirmations for the given transaction ID : ' + confirmations)

    let transaction = await func.getRawTransaction(transactionID)
    console.log('Raw transaction in JSON Format : \n\n'+'-'.repeat(30))
    console.dir(transaction)
    console.log('-'.repeat(30)+'\n\n')
    
}

test()
