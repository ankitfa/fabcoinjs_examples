const func = require('./commonFunctions')


async function test() {
    let apiStatus = await func.checkAPIStatus('http://fabexplorer.info')
    console.log("API Status : "+apiStatus)
    if(!apiStatus) {
        console.log("The API is currently down. Please try again after some time.")
        return
    }

    //This function can be used to check the balance with only mnemonics available
    let balance = await func.getBalanceForMnemonics('zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong')
    console.log("Balance : "+balance)
}


test()

