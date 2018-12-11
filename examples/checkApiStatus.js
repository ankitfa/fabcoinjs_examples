const func = require('../commonFunctions')
const apiEndPoint = 'http://fabexplorer.com'

func.checkAPIStatus(apiEndPoint).then(res => {
    console.log("API Status : "+ ((res) ? "API OK" : "API Broken"))
})