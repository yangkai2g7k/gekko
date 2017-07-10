/**
 * Created by kaiyan2 on 7/10/17.
 */
var chai = require('chai');
var expect = chai.expect;
var should = chai.should;
var sinon = require('sinon');
var proxyquire = require('proxyquire');

var _ = require('lodash');
var moment = require('moment');

var util = require(__dirname + '/../../../core/util');
var config = util.getConfig();
var dirs = util.dirs();

var TRADES = require('./data/yunbi_trades.json');


// var Yunbi = require(dirs.exchanges + 'yunbi');
// var yunbi = new Yunbi(config.watch);

// yunbi.getPortfolio(function (err,result) {
//     console.log("getPortfolio");
//     console.log(result);
// });
//
// yunbi.getTicker(function (err,result) {
//     console.log("getTicker");
//     console.log(result);
// });
//
// yunbi.getFee(function (error,result) {
//     console.log("getFee");
//     console.log(result);
// });

// yunbi.buy(0.1,1,function (error,result) {
//     console.log("buy");
//     console.log(result);
// });
//
// yunbi.sell(10,300,function (error,result) {
//     console.log("sell");
//     console.log(result);
// });
//
// yunbi.checkOrder("452492465",function (error,result) {
//    console.log("checkOrder");
//    console.log(result);
// });
//
// yunbi.cancelOrder("452492465",function (error,result) {
//     console.log("cancelOrder");
//     console.log(result);
// });
//
// yunbi.getTrades(null,function (error,result) {
//    console.log("getTrades");
//    console.log(result);
// });
