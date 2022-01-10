// const Tx = require('ethereumjs-tx');

module.exports.sendTransaction = function (
    contractAddress,
    methodCall,
    addressFrom,
    privateKey,
    ethVal,
    cb
) {
    const encodedABI = methodCall.encodeABI();
    // const privateKeyHex = Buffer.from(privateKey, "hex");
    console.log(contractAddress,methodCall,addressFrom,privateKey);
    web3.eth.getGasPrice()
    .then(gPrize => {
        web3.eth.getTransactionCount(addressFrom).then(txCount => {
            web3.eth.getBlock("latest").then(block => {
                var txData;
                if (ethVal == null) {
                    txData = {
                        nonce: web3.utils.toHex(txCount),
                        gasLimit: web3.utils.toHex(360000),
                        gasPrice: web3.utils.toHex(1000),
                        from: addressFrom,
                        to: contractAddress,
                        data: encodedABI
                    }
                } else {
                    txData = {
                        nonce: web3.utils.toHex(txCount),
                        gasLimit: web3.utils.toHex(360000),
                        gasPrice: web3.utils.toHex(1000),
                        from: addressFrom,
                        to: contractAddress,
                        data: encodedABI,
                        value: web3.utils.toHex(web3.utils.toWei(String(ethVal), 'ether'))
                    }
                }
                web3.eth.accounts.signTransaction(txData,'0x'+privateKey).then(signedData =>{
                    console.log(signedData.rawTransaction)

                    web3.eth
                    .sendSignedTransaction(signedData.rawTransaction)
                    .on("transactionHash", function(hash){
                        console.log("Transaction Hash : " + hash);
                    })
                    .on("receipt", function(receipt) {
                        console.log("Receipt : " + receipt);
                        cb(true);
                    })
                    .on("confirmation", function(confirmationNumber, receipt) {
                        console.log("Confirmation No : " + confirmationNumber);
                    })
                    .on("error",function(error){
                        console.log("Error: " + error);
                        cb(false);
                    })
                    .catch(function(error){
                        console.log("Web3 Exception Handled: \n" + error);
                    })
                })
                // const transaction = new Tx(txData);
                // transaction.sign(privateKeyHex);

                // const serializedTx = transaction.serialize().toString("hex");

                // 

            })
        })
    })
}