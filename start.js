const Binance = require('binance-api-node').default;  
var config = require('./config.json');
var binanceClient = Binance({
    apiKey: config.apiKey,
    apiSecret: config.apiSecret
});

//pair is XRPBTC, BTCUSD, etc.
var GetBinancePrices = (async() => {
    var prices = await binanceClient.allBookTickers();
    return prices;    
    // return {Bid: parseFloat(prices.pair.bidPrice).toFixed(8), BidVolume: prices.pair.bidQty, Ask: parseFloat(prices.pair.askPrice).toFixed(8), AskVolume: prices.pair.askQty};
});

var CompareAllThreePrices = (async () => {
    var allPrices = await GetBinancePrices();
    var xrpSellQty = 1000;
    var xrpSellTotalUSD = xrpSellQty * parseFloat(allPrices.XRPUSDT.bidPrice);
    var btcBuyTotal = xrpSellTotalUSD / parseFloat(allPrices.BTCUSDT.askPrice);
    var btcToXrpSellTotal = btcBuyTotal / parseFloat(allPrices.XRPBTC.bidPrice);
    
    var xrpProfit = btcToXrpSellTotal - xrpSellQty;
    var usdProfit = xrpProfit * parseFloat(allPrices.XRPUSDT.bidPrice);
    
    var totalCommision = (xrpSellTotalUSD * 0.00075) * 3;

    var totalProfit = (usdProfit - totalCommision);

    if(totalProfit > 0){
        console.log("------ Profitable trade setup as of ", new Date(), "-------");
        console.log("You could currently sell 1,000 XRP for $", xrpSellTotalUSD);
        console.log("You could currently buy $", xrpSellTotalUSD, "which is worth (b)", btcBuyTotal);
        console.log("You could currently sell ", btcBuyTotal, "worth of Bitcoin for", btcToXrpSellTotal, "worth of XRP");
        console.log("Total profit in XRP: ", xrpProfit, ".  Total profit in USD: $", usdProfit);
        console.log("Total commission in USD would be $", totalCommision);
        console.log("Total profit/loss: $", totalProfit);
    }

});

CompareAllThreePrices();
setInterval(() => {
    CompareAllThreePrices();
}, 60000);