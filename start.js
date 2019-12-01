const argv = require('yargs').argv;
var cryptoCurrency =  argv.crypto;
if(!cryptoCurrency){
    console.log('Missing crypto parameter');
    return;
}
var maxSell =  argv.maxSell;
if(!maxSell){
    console.log('Missing maxSell parameter');
    return;
}
console.log('Monitoring fo arb situations on', cryptoCurrency);


const Binance = require('binance-api-node').default;  
var config = require('./config.json');
var binanceClient = Binance({
    apiKey: config.apiKey,
    apiSecret: config.apiSecret
});

var GetBinancePrices = (async() => {
    var prices = await binanceClient.allBookTickers();
    return prices;    
});

var CompareAllThreePrices = (async () => {
    var allPrices = await GetBinancePrices();
    var sellQty = parseFloat(allPrices[cryptoCurrency + 'USDT'].bidQty);
    //If the top buyer is offering more than our maxSell, only sell the maxSell
    if(sellQty > parseFloat(maxSell)){
        sellQty = maxSell;
    }
    var sellTotalUSD = sellQty * parseFloat(allPrices[cryptoCurrency + 'USDT'].bidPrice);
    var btcBuyTotal = sellTotalUSD / parseFloat(allPrices.BTCUSDT.askPrice);
    var btcToXrpSellTotal = btcBuyTotal / parseFloat(allPrices[cryptoCurrency + 'BTC'].bidPrice);
    
    var xrpProfit = btcToXrpSellTotal - sellQty;
    var usdProfit = xrpProfit * parseFloat(allPrices.XRPUSDT.bidPrice);
    
    var totalCommision = (sellTotalUSD * 0.00075) * 3;

    var totalProfit = (usdProfit - totalCommision);

    if(totalProfit > 0){
        console.log("------ Profitable trade setup as of ", new Date(), "-------");
        console.log("You could currently sell ", sellQty, cryptoCurrency,"for $", sellTotalUSD);
        console.log("You could currently buy $", sellTotalUSD, "worth of Bitcoin, which is worth (b)", btcBuyTotal);
        console.log("You could currently sell ", btcBuyTotal, "worth of Bitcoin for", btcToXrpSellTotal, "worth of ", cryptoCurrency);
        console.log("Total profit in ", cryptoCurrency, ": ", xrpProfit, ".  Total profit in USD: $", usdProfit);
        console.log("Total commission in USD would be $", totalCommision);
        console.log("Total profit/loss: $", totalProfit);
    }

});

CompareAllThreePrices();
setInterval(() => {
    CompareAllThreePrices();
}, 60000);