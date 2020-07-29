//提供有关扑克牌的可视化，牌型判定和牌型大小比较的函数。

function card_visu(card) {
    /*
    Visualize the given card in format of <color><number>(<real-number>).
    eg. input: 44 =>output: "♦8(44)".
    */
    let color_array = Array('♠', '♥', '♣', '♦');
    let number_array = Array('3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2');
    switch (card) {
        case 54:
            return "Sub(54)"
        case 53:
            return "BJk(53)"
        case 52:
            return "LJk(52)"
        default:
            //console.log(color_array, ',', number_array);
            return color_array[Math.floor(card / 13)] + number_array[card % 13] + '(' + String(card) + ')';
    }
}

function find(arr, value) {
    //return the index that the value first appears in the arr.
    for (let i = 0; i < arr.length; i++)
        if (arr[i] == value)
            return i
    return -1
}

function card_attr(cards) {
    /*
    Judging the given card array belongs to which type of cards.
    （这一部分用英语写就太墨迹了。。用中文写吧。）
    card_attr函数将返回一个json，包含了牌型type（用数字指示<-虽然考虑到js语言的特性，这并不是必要的..）和大小（用于同牌型比较指标）等指标。
    这里定义这些指标：
    牌型编号 牌型        额外json参数
    -1       --         无其他参数（不构成有效牌型）
    0       单张        value(即card%13所得值)。大王，小王该值不求余（因此一定比其他牌大），替牌余-1（因此一定比其他牌小）。
    1       对子        value(即任一张card%13所得值)。大王小王不计入该牌型中。
    2       三张        value(即三张牌中任一张card%13所得值)；if_with(指示是否包含了带牌)。
    3       顺子        value(大小为顺子中最小牌的值)，length(指示顺子的长度)。
    4       连对        value(大小为连对中最小牌的值)，length（指示连对的长度）。
    5       飞机        value（大小为连对中最小牌的值），length（指示连对的长度），if_with（指示是否包含了带牌）。
    6       炸弹        value（大小即四张牌中任一张card%13所得值）；if_with（指示是否包含了带牌）。
    7       王炸        value=14大于普通任何类型。
    8       五个炸/三个王   value=255,大于普通王炸。
    Arugments:
        cards:[array]
    */
    //为了方便，该函数内不考虑替牌。
    function stats(cards) {
        /* 给出给定牌组的相同数值牌数量统计。
        其中末位代表了王牌的数目。
        Args:
        cards[Array] -- 即牌组。
        Returns:
        stats[Array] -- 返回
        */
        stats_array = Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        for (let i = 0; i < cards.length; i++) {
            if (cards[i] < 13)
                stats_array[cards[i]] += 1;
            else
                stats_array[13] += 1;
        }
        let ret_counter = Array([], [], [], [], [])
        for (let i = 4; i > 0; i--) {
            for (let j = 0; j < 14; j++)
                if (stats_array[j] == i)
                    ret_counter[i - 1].push(j);

        }
        //console.log(ret_counter);
        return ret_counter
    }

    function is_continuous(uucards, utype) {
        /* 判断给定的若干纸牌是否是顺序的。
        要求给定的输入不重复且唯一。
        最大达到2，王的条件同样被排除在外。
        比如，3 4 5是连续的，3 6则不是。*/
        if (uucards.length < least_rule[utype])
            return false
        if (uucards[uucards.length - 1] >= 12)
            return false
        //uucards.sort(function (a, b) { return a - b });
        //console.log(uucards[uucards.length-1]);
        for (i = 0; i < uucards.length - 1; i++)
            if (uucards[i + 1] - uucards[i] != 1)
                return false
        return true
    }
    //Display cards
    //console.log('Cards:', cards.map(obj => card_visu(obj)))

    // Discard the color information
    cards = cards.map(obj => function (obj) {
        if (obj < 52)
            return obj % 13
        return obj
    }(obj))

    //カードの状況をゲットする。 
    let card_no_stats = stats(cards);

    // THE FINAL BOMB!!!
    if (card_no_stats[4].length != 0 || (card_no_stats[2] == 1 && card_no_stats[2][0]))
        return { 'type': 8, 'value': 255 }
    // 4 same cards situation
    // no two more bombs once
    if (card_no_stats[3].length > 1)
        return { 'type': -1 }
    // bomb and four_carry_two
    if (card_no_stats[3].length == 1) {
        if (cards.length == 6)
            return { 'type': 6, 'value': card_no_stats[3][0], 'if_with': true }
        if (cards.length == 4)
            return { 'type': 6, 'value': card_no_stats[3][0], 'if_with': false }
        // any bomb included in other type is not allowed.
        return { 'type': -1 }
    }

    // 3 same cards situation
    if (card_no_stats[2].length != 0) {
        // plane(not carried) or three only
        // give up comprehensing 333444555+666 in this version
        if (card_no_stats[0].length + card_no_stats[1].length == 0) {
            if (card_no_stats[2].length == 1)
                return { 'type': 2, 'value': card_no_stats[2][0], 'if_with': false }
            if (is_continuous(card_no_stats[2]), 'triple')
                return { 'type': 5, 'length': card_no_stats[2].length, 'value': card_no_stats[2][0], 'if_with': false }
            return { 'type': -1 }
        }

        // plane(carried) or three_carry_one
        if (card_no_stats[2].length == card_no_stats[0].length + card_no_stats[1].length * 2) {
            if (card_no_stats[2].length == 1) {
                return { 'type': 2, 'value': card_no_stats[2][0], 'if_with': true }
            }
            if (is_continuous(card_no_stats[2]), 'triple')
                return { 'type': 5, 'length': card_no_stats[2].length, 'value': card_no_stats[2][0], 'if_with': true }
            return { 'type': -1 }
        }
        /* consider situation that almost impossible.
        happens only when card_no_stat[2].length>=4.
        example: 333444555666+7778
        */
        if (card_no_stats[2].length >= 4 && card_no_stats[2].length - (card_no_stats[0].length + card_no_stats[1].length * 2) == 3) {
            if (is_continuous(card_no_stats[2].slice(1)), 'triple')
                return { 'type': 5, 'length': card_no_stats[2].length - 1, 'value': card_no_stats[2][1], 'if_with': true }
            if (is_continuous(card_no_stats[2].slice(0, -1)), 'triple')
                return { 'type': 5, 'length': card_no_stats[2].length - 1, 'value': card_no_stats[2][0], 'if_with': true }
        }
        return { 'type': -1 }
    }
    //Double situation
    if (card_no_stats[1].length >= 1) {
        if (card_no_stats[0].length != 0)
            return { 'type': -1 }
        if (card_no_stats[1].length == 1) {
            if (card_no_stats[1][0] == 13)
                return { 'type': 7, 'value': 14 }
            return { 'type': 1, 'value': card_no_stats[1][0] }
        }
        if (is_continuous(card_no_stats[1], 'double'))
            return { 'type': 4, 'length': card_no_stats[1].length, 'value': card_no_stats[1][0] }
        return { 'type': -1 }
    }

    //Single situation
    if (card_no_stats[0].length == 1)
        return { 'type': 0, 'value': card_no_stats[0][0] }
    if (is_continuous(card_no_stats[0], 'single'))
        return { 'type': 3, 'length': card_no_stats[0].length, 'value': card_no_stats[0][0] }

    // Not Satisfied
    return { 'type': -1 }
}

function card_compare(type_A, type_B) {
    // compare two types of cards.

    // starter condition
    if (type_B.type < 0)
        return true
    // bomb condition
    if (type_A.type >= 7 || (type_A.type == 6 && type_B.type != 6))
        return true
    if (type_B.type >= 7 || (type_A.type != 6 && type_B.type == 6))
        return false

    // normal comparsion
    // attribute equation.
    if (type_A.type != type_B.type)
        return false
    for (i in type_A) {
        if (i == 'value')
            continue
        else if (type_A.i != type_B.i) return false
    }
    // value comparsion
    if (type_A.value > type_B.value) return true
    return false
}

function card_handsort(a, b) {
    // sort the cards in hand.
    // use it when using 'sort'.
    //console.log(card_visu(a),'>',card_visu(b),'is',a % 13 + a / 130 > b % 13 + b / 130);
    if (a < 52 && b < 52)
        return (a % 13 + a / 130) - (b % 13 + b / 130)
    if (b < 52)
        return 1
    if (a < 52)
        return -1
    return a - b
}

function shuffle_and_lord(fighters) {
    /*
    Arguments:
    fighters[number] -- 3 or 4.
    */
    // Decide the num of cards.
    let card_num = -1;
    let hide_num = 3;
    least_rule = {};
    if (fighters == 3) {
        card_num = 54;
        least_rule = { 'single': 5, 'double': 3, 'triple': 2 };
    }
    else if (fighters == 4) {
        card_num = 55;
        least_rule = { 'single': 4, 'double': 2, 'triple': 2 };
    }
    else
        throw "invalid participant fighters number!";
    let unhide_num = card_num - hide_num
    console.log('create', card_num, 'cards.');

    // Create cards and shuffle them.
    let cards_full = Array(card_num)
    for (let i = 0; i < cards_full.length; i++) {
        cards_full[i] = i;
    }
    cards_full.sort(function (a, b) { return Math.random() - 0.5 });

    // Randomly decide the lord card.
    lord_seq = Math.floor(Math.random() * (unhide_num + 0.99));
    let lord = Math.floor(lord_seq * fighters / unhide_num);
    let lord_card = cards_full[lord_seq];
    //console.log('lord player:', lord, ';lord card:', card_visu(lord_card), 'lord_seq:', lord_seq);

    // Deal
    //console.log('dealing...')
    let cards_in_hands = Array(fighters);
    for (let i = 0; i < fighters; i++) {
        cards_in_hands[i] = cards_full.slice(i * unhide_num / fighters, (i + 1) * unhide_num / fighters);
        cards_in_hands[i].sort(card_handsort)
        //console.log('Player', i, '; Cards:', cards_in_hands[i].map(obj => card_visu(obj)));
        //console.log(cards_in_hands[i]);
    }
    cards_under = cards_full.slice(cards_full.length - hide_num);
    //console.log(cards_under.map(obj => card_visu(obj)));
    return { 'cards_in_hands': cards_in_hands, 'cards_under': cards_under, 'lord': { 'lord_card': lord_card, 'player': lord } }
}

function type2str(typ) {
    let names = ['single', 'double', 'triple', 'series', 'double-series', 'triple-series', 'bomb', 'king-bomb', 'ultra-bomb'];
    if (typ < 0) return 'invaild(-1)'
    return names[typ] + '(' + typ + ')'
}

module.exports = {
    'card_visu': card_visu,
    'card_attr': card_attr,
    'card_compare': card_compare,
    'card_handsort': card_handsort,
    'shuffle_and_lord': shuffle_and_lord,
    'find': find,
    'type2str': type2str,
};