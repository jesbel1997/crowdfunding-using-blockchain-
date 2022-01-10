var express = require('express');
var router = express.Router();
const signTxn = require("./signTxn");

router.get('/', function (req, res, next) {

    var invList = [];
    console.log(req.session.campID);
    CrowdFunding.methods.campaigns(req.session.campID)
        .call()
        .then((val1) => {
            console.log(val1);
            var list = {
                campID: req.query.campID,
                title: web3.utils.hexToAscii(val1["title"]),
                description: web3.utils.hexToAscii(val1.description),
                teamMembers: web3.utils.hexToAscii(val1.teamMembers),
                minContribution: val1.minContribution,
                balence: web3.utils.fromWei(val1.balence, 'ether'),
            }
            req.session.campTitle = web3.utils.hexToAscii(val1["title"]);
            if (val1.investedCount != 0) {
                var loopCount = 0;
                console.log("invList : ", val1.investedCount)
                for (var i = 1; i <= val1.investedCount; i++) {
                    console.log("invList1 : ", i)

                    CrowdFunding.methods.campaignInvestedDetails(req.session.campID, i)
                        .call()
                        .then((val2) => {
                            loopCount++;
                            console.log("invList2 : ", val2)
                            invList.push({
                                by: val2["0"],
                                amount: web3.utils.fromWei(val2["1"], 'ether'),
                            })
                            console.log(loopCount)
                            if (val1.investedCount == loopCount) {
                                console.log("hoyyyyyyy")

                                res.render('campaign/home', { list, invList });
                                console.log(list);
                            }
                        })
                }
            } else {
                res.render('campaign/home', { list, invList });
            }
        })
});

router.get('/list', function (req, res, next) {

    var list = [];
    CrowdFunding.methods.campaigns(req.session.campID)
        .call()
        .then((val1) => {
            console.log(val1);
            var loopCount = 0;
            console.log("invList : ", val1.requestCount)
            if (val1.requestCount != 0) {
                for (var i = 1; i <= val1.requestCount; i++) {
                    console.log("invList1 : ", i)

                    CrowdFunding.methods.campaignrequestDetails(req.session.campID, i)
                        .call()
                        .then((val3) => {

                            console.log("invList2 : ", val3)
                            loopCount++;

                            list.push({
                                recipient: val3[0],
                                payer: val3[1],
                                purpose: web3.utils.hexToAscii(val3[2]),
                                amount: val3[3],
                                status: val3[4] == 0 ? "Waiting for responce" : (val3[4] == 1 ? "Approved and Paid" : (val3[4] == 2 ? "Rejected" : '')),
                            })
                            console.log("hoyy", val1, i)
                            if (val1.requestCount == loopCount) {
                                console.log("hoyyyyyyy")

                                res.render('campaign/request', { list });
                                console.log(list);
                            }

                        })
                }
            } else {
                res.render('campaign/request', { list });
            }
        })
});

router.get('/new', function (req, res, next) {
    res.render('campaign/newRequest');
});
router.post('/new', function (req, res, next) {

    data = req.body;
    let publicAddress = data.publicAddress;
    let privateKey = data.privateKey;
    let recipient = data.recipient;
    let payer = data.payer;
    let amount = data.amount;
    let purpose = web3.utils.asciiToHex(data.purpose);
    let campID = req.session.campID;
    let campTitle = web3.utils.asciiToHex(req.session.campTitle);
    console.log(recipient,payer,campID,campTitle,amount,purpose)
    let methodCall = CrowdFunding.methods.requestPayment(
        recipient,
        payer,
        campID,
        campTitle,
        amount,
        purpose
    );

    signTxn.sendTransaction(CrowdFundingAddress, methodCall, publicAddress, privateKey, null, function (
        response
    ) {
        if (response == true) res.status(200).json({ status: true });
        else res.status(400).json({ status: false });
    })
});




module.exports = router;
