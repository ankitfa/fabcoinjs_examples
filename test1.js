const func = require('./commonFunctions')
const fs = require('fs')
const axios = require('axios')
const apiExistAddress = ':9001/fabapi/existaddress/'
let mn = 'zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo wrong'

//get address in the change and receive chain and check for existance. 

var isAddressUsed = async function (address) {
    let r = await axios.default.get('http://api1.fabexplorer.net' + apiExistAddress + address).then(res => {
        return res.data
    }).catch (e => {
        return e
    })
    return r
}
async function test() {
    
    // do it for change/internal address
    let idx = 0
    let addressNotPresentCount = 0;
    let topBuffer = 10
    let interval = 3000 //interval between API calls so as to avoid flooding the API endpoint with requests
    let droppedCalls = 0;
    let totalCalls = 0;
    let limiter = 500;
    func.writeToLogFile('')
    while(addressNotPresentCount < topBuffer && idx < limiter) {
        let address = func.getAddress(mn,0,1,idx);
        let isPresent = await isAddressUsed(address)
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
        let isPresent = await isAddressUsed(address)
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

test()