const fabcoinjs = require('fabcoinjs')
const bip39 = require('bip39')
const bip32 = require('bip32')
const web3 = require('web3-eth-abi')
const axios = require('axios')

const script = fabcoinjs.script
const networks = fabcoinjs.networks
const ECPair = fabcoinjs.ECPair
const payments = fabcoinjs.payments
const TransactionBuilder = fabcoinjs.TransactionBuilder

const apiExistAddress = ':9001/fabapi/existaddress/'
const apiUtxo = ':8666/transactions?'
const apiSendTx = ":9001/fabapi/sendrawtransaction/"
const apiGetTx = ":9001/fabapi/getrawtransaction/"
const apiCallContract = ":9001/fabapi/callcontract"
const apiBlockchainInfo = ":9001/fabapi/getblockchaininfo"
const apiGetTokenList = ":9001/fabapi/gettokenlist"
const myApiEndPoint = 'http://fabexplorer.com' // api to be changed later


class UtxoObject {
    constructor(txId, txIdx, value, address, keypair) {
        this.TxId = txId
        this.TxIdx = txIdx
        this.Value = value
        this.Address = address
        this.Keypair = keypair
    }
}

//design and manage this class that takes care of all the wallet, mostly UTXO related operations
class Wallet {
    constructor() {
        this.UTXO = null
    }
}

/**
 * @param {string} mnemonics A valid 12 word bip39 compliant mnemonic
 * @param {Number} account
 * @param {Number} chainType
 * @param {Number} addressIndex
 */
var getAddress = function (mnemonics, account, chainType, addressIndex) {
    // TODO check all the parameters for their validity
    let mn = bip39.mnemonicToSeed(mnemonics)
    let ad = bip32.fromSeed(mn, networks.fabcoin).derivePath('m/44/0\'/' + Number(account).toString() + '\'/' + Number(chainType).toString() + '/' + Number(addressIndex).toString())
    return payments.p2pkh({ pubkey: ad.publicKey, network: networks.fabcoin }).address
}

/**
 *
 * @param {string} mnemonics
 * @param {Number} account
 * @param {Number} chainType
 * @param {Number} addressIndex
 * @returns  keypair for the given mnemonic and point in the hierarchy
 */
var getKeyPair = function (mnemonics, account, chainType, addressIndex) {
    let mn = bip39.mnemonicToSeed(mnemonics)
    let ad = bip32.fromSeed(mn, networks.fabcoin).derivePath('m/44/0\'/' + Number(account).toString() + '\'/' + Number(chainType).toString() + '/' + Number(addressIndex).toString())
    return ECPair.fromWIF(ad.toWIF(), networks.fabcoin)
}

/**
 *
 * @param {string} apiEndPoint A URL for connecting to the API
 * @returns returns true if the API request receives expected response, false otherwise
 */
var checkAPIStatus = async function (apiEndPoint) {
    // generate a random address
    let mn = bip39.mnemonicToSeed('')
    let ad = bip32.fromSeed(mn, networks.fabcoin).derivePath('m/44/0\'/0\'/1')
    let address = payments.p2pkh({ pubkey: ad.publicKey, network: networks.fabcoin }).address
    let res = await axios.get(apiEndPoint + apiExistAddress + address)
        .then(function (response) {
            let r = false
            if (typeof (response.data) === 'boolean') {
                r = true
            }
            return r
        })
        .catch(function (error) {
            // this means that there is something wrong with the API connection
            // console.log(error.message)
            if (error) return false
        })
    return res
}

var getBalanceForMnemonics = async function (mnemonics, apiEndPoint) {

    let utxos = await getUtxosForMnemonic(mnemonics,apiEndPoint)
    let value = 0
    utxos.forEach((utxo) => {
        value += utxo.value
    })
    return value.toFixed(8);

}

var getUtxosForMnemonic = async function (mnemonics,apiEndPoint) {

    let ApiEndPoint = (apiEndPoint) ? apiEndPoint : myApiEndPoint
    let myUtxo = []
    let mn = bip39.mnemonicToSeed(mnemonics)
    mnemonics = '************************************************************************'
    let internalHDNode = bip32.fromSeed(mn, networks.fabcoin).derivePath('m/44/0\'/0\'/0')
    let externalHDNode = bip32.fromSeed(mn, networks.fabcoin).derivePath('m/44/0\'/0\'/1')
    mn = '********************************************************************************'
    // 10th address - every 10th subsequent address until false is returned and when false is returned, 10 after to make sure no more addresses have been used
    let internalAddressIndex = 0
    let internalAddressUnusedCount = 0
    let externalAddressIndex = 0
    let externalAddressUnusedCount = 0

    // crawl the internal chain
    while (internalAddressUnusedCount < 10) {
        //internalAddressUnusedCount++
        let addressArray = []
        let mUrl = ApiEndPoint + apiUtxo
        for (let i = 0; i < 10; i++) {
            let ad = internalHDNode.derive(internalAddressIndex)
            let address = payments.p2pkh({ pubkey: ad.publicKey, network: networks.fabcoin }).address
            // console.log(address)
            addressArray.push({ address: address, index: internalAddressIndex })
            internalAddressIndex++;

            replaceConsoleMessage("Checking address " + internalAddressIndex + " in the internal Chain." + ('.'.repeat((internalAddressIndex / 10) % 15)))

            if (i === 0) mUrl += "address=" + address
            else mUrl += "&address=" + address
        }
        //console.log(mUrl)
        let response = [];
        await axios.default.get(mUrl).then(res => {
            response = res;
        }).catch(e => {
            // console.log("There was an error.")
            // console.log(e)
        })

        let rr = new Array()
        rr = response.data.result;
        for (let i = 0; i < rr.length; i++) {
            if (rr[i].utxos.length > 0) {
                let idx = 0
                if (rr[i].address === addressArray[i].address) {
                    idx = addressArray[i].index
                }
                else { //this is a highly unlikely scenario but needs to be taken into account
                    for (let j = 0; j < addressArray.length; j++) {
                        if (rr[i].address === addressArray[j].address) {
                            idx = addressArray[i].index;
                        }
                    }
                }

                for (let j = 0; j < rr[i].utxos.length; j++) {
                    let utxo = rr[i].utxos[j]
                    utxo.address = rr[i].address
                    utxo.chainType = 'internal'
                    utxo.addressIndex = idx
                    myUtxo.push(utxo)
                }
            }
        }

        if (!(await isAddressUsed(addressArray[addressArray.length - 1].address))) {
            internalAddressUnusedCount++
            for (let k = 0; k < 10; k++) { //At least 10 unused addresses must be found
                let ad = internalHDNode.derive(internalAddressIndex + k)
                let address = payments.p2pkh({ pubkey: ad.publicKey, network: networks.fabcoin }).address
                if (!(await isAddressUsed(address))) {
                    replaceConsoleMessage("Checking address " + (internalAddressIndex + k) + " in the internal Chain." + ('.'.repeat(k)))
                    internalAddressUnusedCount++
                }
                else {
                    internalAddressUnusedCount = 0;
                }
            }
        }
    }

    console.log("\nInternal Chain crawling complete for the given mnemonics.")

    while (externalAddressUnusedCount < 10) {

        let addressArray = []
        let mUrl = ApiEndPoint + apiUtxo
        for (let i = 0; i < 10; i++) {
            let ad = externalHDNode.derive(externalAddressIndex)
            let address = payments.p2pkh({ pubkey: ad.publicKey, network: networks.fabcoin }).address
            // console.log(address)
            addressArray.push({ address: address, index: externalAddressIndex })
            externalAddressIndex++;

            let s = ''
            for (let i = 0; i < externalAddressIndex; i = i + 10) {
                s += '.'
                if (s.length > 15) s = ''
            }

            replaceConsoleMessage("Checking address " + externalAddressIndex + " in the external Chain." + ('.'.repeat((externalAddressIndex / 10) % 15)))

            if (i === 0) mUrl += "address=" + address
            else mUrl += "&address=" + address
        }
        //console.log(mUrl)
        let response = [];
        await axios.default.get(mUrl).then(res => {
            response = res;
        }).catch(e => {
            // console.log("There was an error.")
            // console.log(e)
        })

        let rr = new Array()
        rr = response.data.result;
        for (let i = 0; i < rr.length; i++) {
            if (rr[i].utxos.length > 0) {
                let idx = 0
                if (rr[i].address === addressArray[i].address) {
                    idx = addressArray[i].index
                }
                else { //this is a highly unlikely scenario but needs to be taken into account
                    for (let j = 0; j < addressArray.length; j++) {
                        if (rr[i].address === addressArray[j].address) {
                            idx = addressArray[i].index;
                        }
                    }
                }

                for (let j = 0; j < rr[i].utxos.length; j++) {
                    let utxo = rr[i].utxos[j]
                    utxo.address = rr[i].address
                    utxo.chainType = 'external'
                    utxo.addressIndex = idx
                    //  utxo.keypair = bip32.fromWIF( externalHDNode.derive(idx).toWIF() )
                    myUtxo.push(utxo)
                }
            }
        }

        if (!(await isAddressUsed(addressArray[addressArray.length - 1].address))) {
            externalAddressUnusedCount++
            for (let k = 0; k < 10; k++) { //At least 10 unused addresses must be found
                let ad = externalHDNode.derive(externalAddressIndex + k)
                let address = payments.p2pkh({ pubkey: ad.publicKey, network: networks.fabcoin }).address
                if (!(await isAddressUsed(address))) {
                    replaceConsoleMessage("Checking address " + (externalAddressIndex + k) + " in the external Chain." + ('.'.repeat(k)))
                    externalAddressUnusedCount++
                }
                else {
                    externalAddressUnusedCount = 0;
                }
            }
        }
    }
    console.log("\nExternal Chain crawling complete for the given mnemonics.")

    return myUtxo;
}

var getbalanceForAddresses = async function (addresses) {

}

var replaceConsoleMessage = function (msg) {
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write(msg)
}

/**
 * 
 * @param {string} txid Transaction ID
 * @returns number of confirmations for a valid transaction 
 */
var getTransactionConfirmations = async function (txid) {
    let cnf = await axios.default.get(myApiEndPoint + apiGetTx + txid + '/true').then(res => {
        return res.data.confirmations
    }).catch(e => {
        return -1 //not confirmed or invalid txid
    })

    return cnf
}

/**
 * 
 * @param {string} txid Transaction ID
 * @returns Raw Transaction in JSON format for the given valid transaction ID 
 */
var getRawTransaction = async function (txid) {
    let res = await axios.default.get(myApiEndPoint + apiGetTx + txid + '/true').then(res => {
        return res.data
    }).catch(e => {
        throw e
    })
    return res
}

/**
 * 
 * @param {string} address address to be checked if it has ever been used in the blockchain
 * @returns true if the address has ever been used in the blockchain, false otherwise
 */
var isAddressUsed = async function (address) {
    let r = await axios.default.get('http://fabexplorer.info' + apiExistAddress + address)
    return r.data
}

/**
 * 
 * @param {string} mnemonic 
 * @param {ReceiveAddressAndValueObjectArray} receiveAddressesAndValue Must be in the json format
 * @param {string} changeAddress 
 * @param {Number} fee The value of fee must be in fabcoin. if no fee is provided, it will be calculated internally depending 
 * upon the size of UTXOs 
 * @returns true if the transaction went through, false otherwise 
 */
var buildTransactionByMnemonics = async function (mnemonic, receiveAddressesAndValues, changeAddress, fee) {

    let myUtxos = await getUtxosForMnemonic(mnemonic)
    let balance = 0
    let totalValueToBeSent = 0;
    let myFee;

    myUtxos.forEach((utxo) => {
        balance += utxo.value
    })

    receiveAddressesAndValues.forEach((rv) => {
        totalValueToBeSent += rv.value
    })

    if (!fee) {
        myFee = 3000;

        let tmp = 0;
        let i = 0;
        while (balance < tmp && i < myUtxos.length) {
            tmp += myUtxos[i].value
            i++
            myFee += 300; //per input, add 300 LIUs
        }
    }
    else {
        myFee = fee
    }

    if (totalValueToBeSent + myFee > balance) {
        throw 'insufficient Balance'
    }

    let Tx = new TransactionBuilder(networks.fabcoin)

    let tmp = 0;
    let i = 0;
    while (balance + myFee < tmp) {
        Tx.addInput(myUtxos[i].txid, myUtxos[i].sequence)
    }
}

/**
 *  
 * @param {UtxoObject} utxos 
 * @param {ECPair_Object} keypairs 
 * @param {ReceiveAddressAndValueObject} receiveAddressAndValue
 * @param {string} changeAddress 
 * @param {Number} fee 
 * @returns true if the transaction went through, false otherwise
 */
var buildTransactionByUTXOs = async function (utxos, keypairs, receiveAddressAndValue, changeAddress, fee) {

}

module.exports = {
    getAddress,
    getBalanceForMnemonics,
    getKeyPair,
    getRawTransaction,
    getTransactionConfirmations,
    getUtxosForMnemonic,
    getbalanceForAddresses,
    checkAPIStatus
}
