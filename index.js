const Crawler = require("crawler");
const querystring = require('querystring');

let startTokenId = 1;
let endTokenId = 10000;
const contractAddress = "0x9bfa45382268e4bacbd1175395728153dc5248f2";

const MAX_FETCH_UNIT = 30;

let token = [];
let result = [];
 
var c = new Crawler({
    maxConnections : 1,
    rateLimit: 2000,
    jQuery:false,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            let json = JSON.parse(res.body);
            if(json.detail){
                //console.log("error : " + json.detail);
                console.log("retrying");
                console.log(res.options.uri);
                c.queue(res.options.uri);
            } else {
                json.orders.forEach((item)=>{
                    console.log(item.asset.token_id);
                    result.push(item.asset.token_id);
                });
            }
        }
        done();
    }
});

c.on('drain',function(){
    //console.log(result);
    result = result.map((val)=>parseInt(val)).sort();
    console.log(result);
});

let expectedLoop = Math.ceil((endTokenId - startTokenId + 1 ) / MAX_FETCH_UNIT);

for(let i = 0; i < expectedLoop; i++){
    token = Array.from(new Array(MAX_FETCH_UNIT),(val,index) => i * MAX_FETCH_UNIT + index + startTokenId );
    token = token.filter((val)=>val <= endTokenId);
    let qs = querystring.stringify({
        asset_contract_address: contractAddress,
        bundled: 'false',
        include_bundled: 'false',
        include_invalid: 'false',
        token_ids: token,
        side: '1',
        limit: '50',
        offset: '0',
        order_by: 'created_date',
        order_direction: 'desc'
    });
    c.queue("https://api.opensea.io/wyvern/v1/orders?" + qs)
}
