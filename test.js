const func = require('./commonFunctions')
const fs = require('fs')
const axios = require('axios')
let mn = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong'

const apiEndPoints = [  "http://fabexplorer.info",
                       "http://fabexplorer.com",
                       "http://api.fabcoin.biz",
                       "http://api1.fabcoin.club",
                       "http://api2.fabcoin.club",
                       "http://api3.fabcoin.club",
                       "http://api1.fabexplorer.net",
                       "http://api2.fabexplorer.net",
                       "http://api3.fabexplorer.net"   ]


const apiSendTx = ":9001/fabapi/sendrawtransaction/"
const apiGetTx = ":9001/fabapi/getrawtransaction/"
const apiExistAddress = ":9001/fabapi/existaddress/"
const apiUtxo = ":8666/transactions?"
const apiCallContract = ":9001/fabapi/callcontract"
const apiBlockchainInfo = ":9001/fabapi/getblockchaininfo"
const apiGetTokenList = ":9001/fabapi/gettokenlist"


async function getTxApiTest() {
    let totalCalls = 0;
    let droppedCalls = 0;
    for(let i =0 ;i < 10; i++){
        for(j = 0; j < apiEndPoints.length ; j++){
             let utxo = await axios.default.get(apiEndPoints[j] + 
                apiGetTx+'7425990ed0ed45f4cb123e72f22a09d3c08aa638af4871795f881cca959759ee/true' ).then(res=>{
                    console.dir("API : "+apiEndPoints[j] + "    Response : "+res.data.confirmations)
                    totalCalls++
             }).catch (e => {
                 console.log("Error : " + e)
                 droppedCalls++

             })
        }
    }
    console.log("\nGet Raw Transaction API\nTotal Calls : "+totalCalls+"\nDropped Calls : "+droppedCalls)
}


async function utxoApiTest() {
    let totalCalls = 0;
    let droppedCalls = 0;
    for(let i =0 ;i < 10; i++){
        for(j = 0; j < apiEndPoints.length ; j++){
             let utxo = await axios.default.get(apiEndPoints[j] + 
                apiUtxo+'address=15R8RLig2dD7JFfJcZfqEnr3Fbe79TtUfM' ).then(res=>{
                    console.dir("API : "+apiEndPoints[j] + "    Response : "+res.data.status)
                    totalCalls++
             }).catch (e => {
                 console.log(e)
                 droppedCalls++

             })
        }
    }

    console.log("\nUTXO API\nTotal Calls : "+totalCalls+"\nDropped Calls : "+droppedCalls)
}

async function existAddressApiTest() {
    
    // do it for change/internal address
    let idx = 0
    let addressNotPresentCount = 0;
    let topBuffer = 10
    let interval =  0//interval between API calls so as to avoid flooding the API endpoint with requests
    let droppedCalls = 0;
    let totalCalls = 0;
    let limiter = Infinity 
    func.writeToLogFile('')
    while(addressNotPresentCount < topBuffer && idx < limiter) {
        let address = func.getAddress(mn,0,1,idx);
        let isPresent = await func.isAddressUsed(address)
        if(typeof(isPresent) !== "boolean") droppedCalls++
        await func.wait(interval)
        func.addToLogFile(idx + ' : ' +address + ' : ' + isPresent )
        console.log(idx + ' : ' +address + ' : ' + isPresent )
        idx++; 
        totalCalls++;
        if(!isPresent) addressNotPresentCount++ 
        else addressNotPresentCount = 0
    }
    

    //do the same for receive/external address
    idx = 0
    addressNotPresentCount = 0;
    while(addressNotPresentCount < topBuffer && idx < limiter) {

        let address = func.getAddress(mn,0,0,idx);
        let isPresent = await func.isAddressUsed(address)
        if(typeof(isPresent) !== "boolean") droppedCalls++
        await func.wait(interval)
        func.addToLogFile(idx + ' : ' +address + ' : ' + isPresent)
        console.log(idx + ' : ' +address + ' : ' + isPresent)
        idx++;
        totalCalls++;
        if(!isPresent) addressNotPresentCount++ 
        else addressNotPresentCount = 0
    }

    console.log("Interval between Calls : " + interval + "\nDropped Calls : " + droppedCalls+"\nTotal Calls : "+totalCalls)
}

getTxApiTest()