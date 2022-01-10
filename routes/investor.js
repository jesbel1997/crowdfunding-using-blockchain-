var express = require('express');
var router = express.Router();
const signTxn = require("./signTxn");

// /* GET users listing. */
// router.get('/', function (req, res, next) {
//     console.log(req.session.type)
//     res.send("req.session.type");
// });

router.get('/newList', function (req, res, next) {
    var list = []
    CrowdFunding.methods.campaignCount()
        .call()
        .then((val) => {
            console.log(val);
            var loopCount = 0;
            if (val > 0) {
                for (var i = 1; i <= val; i++) {

                    CrowdFunding.methods.campaigns(i)
                        .call()
                        .then((val1) => {
                            loopCount++;
                            console.log(val1);
                            list.push({
                                title: web3.utils.hexToAscii(val1["title"]),
                                description: web3.utils.hexToAscii(val1.description),
                                teamMembers: web3.utils.hexToAscii(val1.teamMembers),
                                minContribution: val1.minContribution,
                            }


                            )
                            console.log("hoyy", val, i)
                            if (val == loopCount) {
                                console.log("hoyyyyyyy")

                                res.render('investor/newCampaign/campaignList', { list });
                                console.log(list);
                            }
                        })
                }
            } else {
                res.render('investor/newCampaign/campaignList', { list });
            }
        })
});

router.get('/newCampaign', function (req, res, next) {
    var invList = [];
    CrowdFunding.methods.campaigns(req.query.campID)
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
            if (val1.investedCount != 0) {
                var loopCount = 0;
                console.log("invList : ", val1.investedCount)
                for (var i = 1; i <= val1.investedCount; i++) {
                    console.log("invList1 : ", i)

                    CrowdFunding.methods.campaignInvestedDetails(req.query.campID, i)
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

                                res.render('investor/newCampaign/campaignDetails', { list, invList });
                                console.log(list);
                            }
                        })
                }
            } else {
                res.render('investor/newCampaign/campaignDetails', { list, invList });
            }
        })
});

router.get('/donate', function (req, res, next) {

    res.render('investor/newCampaign/donateForm', { campID: req.query.campID });
});

router.post('/donate', function (req, res, next) {
    data = req.body;
    let publicAddress = data.publicAddress;
    let privateKey = data.privateKey;
    let campID = data.campID;
    let amount = data.amount;
    console.log(data)
    let methodCall = CrowdFunding.methods.invest(
        campID,
    );

    signTxn.sendTransaction(CrowdFundingAddress, methodCall, publicAddress, privateKey, amount, function (
        response
    ) {
        if (response == true) res.status(200).json({ status: true });
        else res.status(400).json({ status: false });
    })
});

router.get('/investedList', function (req, res, next) {
    var list = [];
    CrowdFunding.methods.investors(req.session.address)
        .call()
        .then((val1) => {
            console.log(val1);
            var loopCount = 0;
            console.log("invList : ", val1.investedCount)
            if (val1.investedCount != 0) {
                for (var i = 1; i <= val1.investedCount; i++) {
                    console.log("invList1 : ", i)

                    CrowdFunding.methods.investorInvestedDetails(i)
                        .call({ from: req.session.address })
                        .then((val2) => {

                            console.log("invList2 : ", val2)

                            CrowdFunding.methods.campaigns(val2)
                                .call()
                                .then((val3) => {
                                    loopCount++;
                                    console.log(val3);
                                    list.push({
                                        title: web3.utils.hexToAscii(val3["title"]),
                                        description: web3.utils.hexToAscii(val3.description),
                                        teamMembers: web3.utils.hexToAscii(val3.teamMembers),
                                        minContribution: val3.minContribution,
                                    })
                                    console.log("hoyy", val1, i)
                                    if (val1.investedCount == loopCount) {
                                        console.log("hoyyyyyyy")

                                        res.render('investor/investedCampaigns/campaignList', { list });
                                        console.log(list);
                                    }
                                })
                        })
                }
            } else {
                res.render('investor/investedCampaigns/campaignList', { list });
            }
        })

});

router.get('/investedCampaign', function (req, res, next) {
    var invList = [];
    CrowdFunding.methods.campaigns(req.query.campID)
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
            var loopCount = 0;
            console.log("invList : ", val1.investedCount)
            for (var i = 1; i <= val1.investedCount; i++) {
                console.log("invList1 : ", i)

                CrowdFunding.methods.campaignInvestedDetails(req.query.campID, i)
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

                            res.render('investor/investedCampaigns/campaignDetails', { list, invList });
                            console.log(list);
                        }
                    })
            }
        })
});

router.get('/requestList', function (req, res, next) {
    
    var list = [];
    CrowdFunding.methods.investors(req.session.address)
        .call()
        .then((val1) => {
            console.log(val1);
            var loopCount = 0;
            console.log("invList : ", val1.requestCount)
            if (val1.requestCount != 0) {
                for (var i = 1; i <= val1.requestCount; i++) {
                    console.log("invList1 : ", i)

                    CrowdFunding.methods.investorrequestDetails(i)
                        .call({from:req.session.address})
                        .then((val3) => {

                            console.log("invList2 : ", val3)
                            loopCount++;

                            list.push({
                                recipient: val3[0],
                                title: web3.utils.hexToAscii(val3[1]),
                                purpose: web3.utils.hexToAscii(val3[2]),
                                amount: val3[3],
                                status: val3[4],
                                reqID:val3[5],
                            })
                            console.log("hoyy", val1, i)
                            if (val1.requestCount == loopCount) {
                                console.log("hoyyyyyyy")

                                res.render('investor/request/requestList', { list });
                                console.log(list);
                            }

                        })
                }
            } else {
                res.render('investor/request/requestList', { list });
            }
        })

    // res.render('investor/request/requestList');
});

router.get('/respondForm', function (req, res, next) {
    res.render('investor/request/respondForm',{id:req.query.reqID});
});

router.post('/respondForm', function (req, res, next) {

    var data = req.body;
    console.log(data);
    let publicAddress = data.publicAddress;
    let privateKey = data.privateKey;
    let methodCall = CrowdFunding.methods.respondPayment(
        data.reqID,
        data.action
    );

    signTxn.sendTransaction(CrowdFundingAddress, methodCall, publicAddress, privateKey, null, function (
        response
    ) {
        if (response == true) res.status(200).json({ status: true });
        else res.status(400).json({ status: false });
    })

    // res.render('investor/request/respondForm',{id:req.query.reqID});
});



module.exports = router;
