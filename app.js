var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')

/*-------------------WEB3 Connection Starts---------------------*/
const Web3 = require('web3');
var CrowdFundingJSON = require(path.join(__dirname, 'build/contracts/CrowdFunding.json'));

//for ganache
web3 = new Web3('ws://localhost:7545');
CrowdFundingAddress = CrowdFundingJSON.networks['5777'].address;

const CrowdFundingAbi = CrowdFundingJSON.abi;

CrowdFunding = new web3.eth.Contract(CrowdFundingAbi, CrowdFundingAddress);
/*-------------------WEB3 Connection Ends----------------------*/

var authenticationRouter = require('./routes/auth');
var campaignRouter = require('./routes/campaign');
var investorRouter = require('./routes/investor');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'ssshhhhh'}));

app.use('/', authenticationRouter);
app.use('/campaign', campaignRouter);
app.use('/investor', investorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
