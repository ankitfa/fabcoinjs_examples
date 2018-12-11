const func = require('../commonFunctions')
const transactionId = 'f15365693b269f650b2042bc7b22ac70c0ec24889ba6fee7d7e40d18a3716d7b'

func.getRawTransaction(transactionId).then(res => {
    console.log(res)
}).catch(e => {
    console.log("There was an error with your request.")
})