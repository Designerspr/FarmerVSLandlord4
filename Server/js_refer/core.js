/*
var http=require("http");

//创建服务器，监听8888端口
//这个地方实例化createServer时候传入了一个function，似乎代表服务器执行的信息？
http.createServer(function (request, response) {

    // 发送 HTTP 头部 
    // HTTP 状态值: 200 : OK
    // 内容类型: text/plain
    response.writeHead(200, {'Content-Type': 'text/plain'});

    // 发送响应数据 "Hello World"
    response.end('Hello World\n');
}).listen(8848, function(){
    // 终端打印如下信息
    console.log('Server running at http://127.0.0.1:8848/');
})
*/
var cardlib = require('./cardlib');
var playerlib = require('./playerlib');

function single_game(fighters_list) {
    let fighter_num = fighters_list.length;
    // Shuffle and Bid
    let reshuffle_time = 0;
    do {
        var if_lord = false;
        ret_shuf = cardlib.shuffle_and_lord(fighter_num);
        // deal cards to object
        for (i = 0; i < fighter_num; i++) {
            fighters_list[i].cards = ret_shuf.cards_in_hands[i];
        }
        // display lord card
        console.log('Player', ret_shuf.lord.player, 'is the inital lord, the card is', cardlib.card_visu(ret_shuf.lord.lord_card));
        // bidding
        for (let i = 0; i < fighter_num; i++) {
            console.log('waiting for player', (ret_shuf.lord.player + i) % fighter_num, '\'s desicion...')
            if (fighters_list[(ret_shuf.lord.player + i) % fighter_num].askLord()) {
                lord_player = (ret_shuf.lord.player + i) % fighter_num;
                if_lord = true;
                break;
            }
        }
        reshuffle_time += 1;
        if (reshuffle_time == 3) {
            lord_player = ret_shuf.lord.player;
            break;
        }
    } while (!if_lord);
    console.log('So the lord is ', lord_player, ',おめでとう！');
    fighters_list[lord_player].add_cards(ret_shuf.cards_under);
    // Game main start
    let coin_rate = 1;
    let dealer = lord_player;
    let finisher = -1;
    // Main game loop
    while (finisher < 0) {
        let card_type_now = { 'type': -1 };
        let noBiggerTrigger = 0;
        // Each epoch loop
        while (1) {
            // Start with last dealer
            // If others give up
            if (noBiggerTrigger == fighter_num - 1) break;
            console.log('Time for Player', dealer);
            ret = fighters_list[dealer].time_to_deal(card_type_now);
            if (ret.status) {
                finisher = dealer;
                break;
            }
            if (ret.type == -1) {
                noBiggerTrigger += 1;
                console.log('Player', dealer, 'gives up this epoch.nBT=', noBiggerTrigger);
                console.log(card_type_now);
                dealer = (dealer + 1) % fighter_num;
                continue;
            }
            console.log('Player ', dealer, 'throw:', ret.card.map(obj => cardlib.card_visu(obj)));
            noBiggerTrigger = 0;
            card_type_now = ret.type;
            console.log(card_type_now);
            if (card_type_now.type >= 7 || (card_type_now.type == 6 && !card_type_now.if_with)) {
                coin_rate *= 2;
                console.log('Coin rate now equals to', coin_rate);
            }
            dealer = (dealer + 1) % fighter_num;
        }
        if (noBiggerTrigger)
            console.log('No one bigger, so the next starter is', dealer);
    }
    // Finished
    console.log('Game finished! Player', finisher, 'Win!')
}
let a1 = playerlib.init_fighter();
let a2 = playerlib.init_fighter();
let a3 = playerlib.init_fighter();
let a4 = playerlib.init_fighter();
single_game([a1, a2, a3, a4]);