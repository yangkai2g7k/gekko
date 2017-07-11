/**
 * Created by kaiyan2 on 7/10/17.
 */
var Yunbi = require("yunbi-api-module");
var _ = require('lodash');
var moment = require('moment');
var log = require('../core/log');

var Trader = function (config) {
    _.bindAll(this);
    if (_.isObject(config)) {
        this.key = config.key;
        this.secret = config.secret;
        this.market = (config.asset + config.currency).toLowerCase();
    }
    this.name = 'Yunbi';
    this.yunbi = new Yunbi(this.key, this.secret);
};

// if the exchange errors we try the same call again after
// waiting 10 seconds
Trader.prototype.retry = function (method, args) {
    var wait = +moment.duration(10, 'seconds');
    log.debug(this.name, 'returned an error, retrying..');

    var self = this;

    // make sure the callback (and any other fn)
    // is bound to Trader
    _.each(args, function (arg, i) {
        if (_.isFunction(arg))
            args[i] = _.bind(arg, self);
    });

    // run the failed method again with the same
    // arguments after wait
    setTimeout(
        function () {
            method.apply(self, args)
        },
        wait
    );
};

Trader.prototype.getPortfolio = function (callback) {
    var set = function (err, data) {
        if (!_.isEmpty(data.error))
            return callback('BITSTAMP API ERROR: ' + data.error);

        var portfolio = [];
        _.each(data["accounts"], function (item) {
            asset = item["currency"].toUpperCase();
            balance = parseFloat(item["balance"]);
            locked = parseFloat(item["locked"]);
            if (balance - locked > 0) {
                portfolio.push({name: asset, amount: balance - locked});
            }
        });

        callback(err, portfolio);
    }.bind(this);

    this.yunbi.getAccount(set);
};

Trader.prototype.getTicker = function (callback) {
    this.yunbi.getTicker(this.market, function (err, data) {
        if (err)
            return this.retry(this.getTicker, marketId);
        callback(null, {
            bid: parseFloat(data["ticker"]["sell"]),
            ask: parseFloat(data["ticker"]["buy"])
        });
    }.bind(this));
};

Trader.prototype.getFee = function (callback) {
    callback(null, 0.0001);
};

Trader.prototype.buy = function (amount, price, callback) {
    this.yunbi.createOrder(this.market, "buy", amount, price,{} ,function (err, result) {
        if (err || result.error)
            return log.error('unable to buy:', err, result);
        callback(null, result.id);
    }.bind(this));
};

Trader.prototype.sell = function (amount, price, callback) {
    this.yunbi.createOrder(this.market, "sell", amount, price, {},function (err, result) {
        if (err || result.error)
            return log.error('unable to sell:', err, result);
        callback(null, result.id);
    }.bind(this));
};

Trader.prototype.checkOrder = function (order, callback) {
    this.yunbi.getOrder(order, function (err, result) {
        if (err || result.error)
            return log.error('unable to check order:', err, result);
        remainingVolume = parseFloat(result["remaining_volume"]);
        callback(null, remainingVolume <= 0);
    }.bind(this));
};

Trader.prototype.cancelOrder = function (order, callback) {
    this.yunbi.cancelOrder(order, function (err, result) {
        console.log(result);
        if (err || !result)
            log.error('unable to cancel order', order, '(', err, result, ')');
    }.bind(this));
};

Trader.prototype.getTrades = function (since, callback, descending, timestamp) {
    var options = {};

    if (since) {
        options["limit"] = 1000;
    }

    if(timestamp){
        options["timestamp"] = timestamp;
    }
    console.log(options);
    var args = _.toArray(arguments);
    this.yunbi.getTrades(this.market,options,function (err,result) {
        if(err)
            return this.retry(this.getTrades, args);

        var trades = _.map(result, function (t) {
            return {
                date: t.at,
                tid: t.id,
                price: t.price,
                amount: t.volume
            }
        });
        callback(null, descending?trades:trades.reverse());
    }.bind(this));
};

module.exports = Trader;