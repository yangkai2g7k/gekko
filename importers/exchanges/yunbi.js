/**
 * Created by kaiyan2 on 7/11/17.
 */

var Yunbi = require("yunbi-api-module");
var util = require('../../core/util.js');
var _ = require('lodash');
var moment = require('moment');
var log = require('../../core/log');

var config = util.getConfig();

var dirs = util.dirs();

var Fetcher = require(dirs.exchanges + 'yunbi');

util.makeEventEmitter(Fetcher);

var end = false;
var done = false;
var from = false;

var fetcher = new Fetcher(config.watch);

var fetch = () => {
    fetcher.import = true;
    fetcher.getTrades(from, handleFetch,false,end);
};

var handleFetch = (unk, trades) => {
    var first = _.first(trades).date;

    // if(first < from) {
    //     log.debug('Skipping data, they are before from date', last.format());
    //     return fetch();
    // }

    if  (first < from) {
        fetcher.emit('done');

        // trades = _.filter(
        //         trades,
        //         t => t.date <= end && t.date >= from
        // )
    }
    end = first;
    console.log(_.size(trades));
    fetcher.emit('trades', trades);
};

module.exports = function (daterange) {

    from = daterange.from.unix();
    end = daterange.to.unix();

    return {
        bus: fetcher,
        fetch: fetch
    }
};
