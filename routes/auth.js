var express = require('express');
var router = express.Router();

const signTxn = require("./signTxn");

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/register-investor', function (req, res, next) {
  res.render('register/investor_reg');
});

router.get('/register-campaign', function (req, res, next) {
  res.render('register/campaign_reg');
});

router.post('/loginInvestor', function (req, res, next) {
  let data = req.body;
  console.log(data)

  let publicAddress = data.publicAddress;
  let password = web3.utils.asciiToHex(data.password);
  console.log(password)

  CrowdFunding.methods.loginInvestor(password)
    .call({ from: publicAddress })
    .then((val) => {
      console.log("heyyy",val);
      if (val == true) {
        req.session.type = 1;
        req.session.address = publicAddress;
        res.status(200).json({ status: true });
      } else {
        res.status(400).json({ status: false });
      }
    })
});

router.post('/loginCampaign', function (req, res, next) {
  let data = req.body;
  console.log(data.publicAddress, data.password)
  let publicAddress = data.publicAddress;
  let password = web3.utils.asciiToHex(data.password);
  console.log(password)
  CrowdFunding.methods.loginCampaign(password)
    .call({ from: publicAddress })
    .then((val) => {
      console.log(val);
      if (val[0] == true) {
        req.session.type = 2;
        req.session.campID = val['1'];
        console.log(req.session)
        res.status(200).json({ status: true });
      } else {
        res.status(400).json({ status: false });
      }
    })
});

router.post('/registerInvestor', function (req, res, next) {

  data = req.body;
  let publicAddress = data.publicAddress;
  let privateKey = data.privateKey;
  let name = web3.utils.asciiToHex(data.name);
  let password = web3.utils.asciiToHex(data.password);

  let methodCall = CrowdFunding.methods.registerInvestor(
    name,
    password,
  );

  signTxn.sendTransaction(CrowdFundingAddress, methodCall, publicAddress, privateKey,null, function (
    response
  ) {
    if (response == true) res.status(200).json({ status: true });
    else res.status(400).json({ status: false });
  });
});

router.post('/registerCampaign', function (req, res, next) {

  data = req.body;
  let publicAddress = data.publicAddress;
  let privateKey = data.privateKey;
  let title = web3.utils.asciiToHex(data.title);
  let description = web3.utils.asciiToHex(data.description);
  let teamName = web3.utils.asciiToHex(data.teamName);
  let minContri = data.minContri;
  let password = web3.utils.asciiToHex(data.password);
  console.log(password)

  let methodCall = CrowdFunding.methods.registerCampaign(
    title,
    description,
    teamName,
    minContri,
    password
  );

  signTxn.sendTransaction(CrowdFundingAddress, methodCall, publicAddress, privateKey,null, function (
    response
  ) {
    if (response == true) res.status(200).json({ status: true });
    else res.status(400).json({ status: false });
  })
});
router.get('/logout', function (req, res, next) {
  req.session=null;
  res.redirect('/');
});
module.exports = router;
