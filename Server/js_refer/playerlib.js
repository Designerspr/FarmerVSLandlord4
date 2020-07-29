var cardlib = require('./cardlib')
var readlineSync = require('readline-sync');

function init_fighter() {
    f = new Object();
    f.cards = [];
    f.isLord = false;
    f.score = 0;
    f.display_cards = function () {
        console.log(this.cards.map(obj => cardlib.card_visu(obj)));
    }
    f.askLord = function () {
        this.display_cards();
        ans = readlineSync.question("do you want to be the lord? (Y/n)");
        if (ans == 'Y')
            return true
        return false
    }
    f.time_to_deal = function (last_deal) {
        // last_deal should be like {'type':...,'value':...}。
        //console.log('My cards..', this.cards);
        this.display_cards();
        let fdeal = [], fattr = [];
        do {
            let readDeal = readlineSync.question("you want to deal...([] for pass):");
            fdeal = eval(readDeal);
            if (fdeal.length == 0)
                return { 'type': -1 }
            // if subcard exists
            if (cardlib.find(fdeal, 54) >= 0) {
                let subpos = cardlib.find(fdeal, 54);
                let leftcards = fdeal.slice(0, subpos).concat(fdeal.slice(subpos + 1));
                let all_poss_attr = []
                let choice = ''
                for (let i = 39; i < 54; i++) {
                    leftcards.push(i);
                    let poss_attr = cardlib.card_attr(leftcards);
                    if (poss_attr.type > 0 && cardlib.find(all_poss_attr.keys, poss_attr.type) < 0) {
                        all_poss_attr[cardlib.type2str(poss_attr.type)] = { 'replace': i, 'attr': poss_attr };
                        //console.log(all_poss_attr);
                    }
                    leftcards.pop();
                }
                //console.log(all_poss_attr);
                //console.log(Object.keys(all_poss_attr)length, 'posses');
                if (Object.keys(all_poss_attr).length == 0) {
                    console.log(fdeal.map(obj => cardlib.card_visu(obj)), 'is invalid now. Try again..');
                    continue
                }
                // selection
                do {
                    console.log(all_poss_attr);
                    choice = readlineSync.question('Select your choice:');
                } while (cardlib.find(all_poss_attr.keys, choice) > 0)
                //console.log(Object.keys(all_poss_attr), cardlib.find(Object.keys(all_poss_attr), choice), all_poss_attr[String(choice)]);
                fattr = all_poss_attr[String(choice)].attr;
            }
            else
                fattr = cardlib.card_attr(fdeal);

            if (fattr.type == -1 || !cardlib.card_compare(fattr, last_deal) || !this.if_in_hand(fdeal)) {
                console.log('yours:', fattr, '; compare Result:', cardlib.card_compare(fattr, last_deal), '; others:', last_deal, '; if in hand:', this.if_in_hand(fdeal));
                console.log(fdeal.map(obj => cardlib.card_visu(obj)), 'is invalid now. Try again..');
                continue
            }
            return { 'status': this.remove_cards(fdeal), 'card': fdeal, 'type': fattr }
        } while (1);
    }
    f.remove_cards = function (dcards) {
        console.log(this.cards.find(function (v, i, o) { if (v == dcards[0]) return i }))
        let empty = false
        for (let i = 0; i < dcards.length; i++)
            for (let j = 0; j < this.cards.length; j++)
                if (this.cards[j] == dcards[i]) {
                    this.cards.splice(j, 1);
                    break;
                }
        if (this.cards.length == 0) empty = true
        return empty
    }
    f.add_cards = function (cards) {
        for (let i = 0; i < cards.length; i++) {
            this.cards.push(cards[i]);
        }
        this.cards.sort(cardlib.card_handsort);
    }
    f.if_in_hand = function (dcards) {
        for (let i = 0; i < dcards.length; i++)
            if (cardlib.find(this.cards, dcards[i]) < 0)
                return false
        return true
    }
    return f;
}

module.exports = { 'init_fighter': init_fighter };