const board = document.querySelector('.board');
const level = document.querySelector('.level')
const person = document.querySelector('.person');
const computer = document.querySelector('.computer');
let swit = document.querySelector('.swit')
let text_hold = 'x';
let combination = [];
let num = 2;
let speechObject;
const bod = document.createElement('div');
const ws = new WebSocket('wss://devbatsy.onrender.com/');
let yourTurn = true
let clientName = null;
class serverPackage{
    constructor(purpose,data){
        this.purpose = purpose;
        this.msg = data
    }
}

window.addEventListener('click', e =>
{
    board_resize();
})

function board_resize()
{
    const width = window.getComputedStyle(board).width;
    let split_arr = width.split('')
    let next_resized = split_arr.filter(value =>Number(value) >= 0 || value === '.');
    let updated = Number(next_resized.join(''));
    let act_size = updated/num;
    let fontSize = act_size/2;
    game_btn.forEach(val =>
        {
            val.style.height = `${act_size}px`; 
            val.style.width = `${act_size}px`; 
            val.style.fontSize = `${fontSize}px`
        })
    board.style.height = width;
}

function ai_speech_sythesis(speech,rate)
{
    const voices = speechSynthesis.getVoices()
    const utterance = new SpeechSynthesisUtterance(speech);
    utterance.voice = voices[0];
    utterance.volume = 1; // From 0 to 1
    utterance.rate = 1.5; // From 0.1 to 10
    utterance.pitch = 1; 
    speechSynthesis.speak(utterance);
}

ws.addEventListener('open', () =>{
    create_array();
    ws.addEventListener('message', ({data}) =>{
        let newData = JSON.parse(data);
        switch(true)
        {
            case newData.purpose === 'welcome':
                clientName = newData.msg
                ai_speech_sythesis(`welcome ${newData.msg}, lets play`);
                run()
            break;
            case newData.purpose === 'result':
                testing();
                function testing()
                {
                    yourTurn = true;
                    let wining = test(combination,game_btn,board,swit);
                    let serverPack = new serverPackage()
                    serverPack.purpose = 'updateUser';
                    switch(true)
                    {
                        case wining.player && wining.algo:
                            // ai_speech_sythesis(speechObject.tie[Math.round(Math.random()*4)]);
                            serverPack.msg = {state:'draw',stateNum:num-1}
                            ws.send(JSON.stringify(serverPack))
                            console.log(serverPack)
                        break;
                        case wining.player:
                            // ai_speech_sythesis(speechObject.Pwin[Math.round(Math.random()*4)]);
                            serverPack.msg = {state:'win',stateNum:num-1};
                            ws.send(JSON.stringify(serverPack));
                            console.log(serverPack)
                        break;
                        case wining.algo:
                            // ai_speech_sythesis(speechObject.Cwin[Math.round(Math.random()*4)]);
                            serverPack.msg = {state:'lose',stateNum:num-1};
                            ws.send(JSON.stringify(serverPack));
                            console.log(serverPack)
                            break;
                        case wining.non:
                            // ai_speech_sythesis(speechObject.non[Math.round(Math.random()*4)]);
                            serverPack.msg = {state:'no win',stateNum:num-1};
                            ws.send(JSON.stringify(serverPack))
                        break;
                        default:
                            switch(true)
                            {
                                case game_btn[newData.msg.answer] !== undefined && game_btn[newData.msg.answer].innerHTML === '':
                                    game_btn[newData.msg.answer].innerHTML = computer.innerHTML;
                                    combination = newData.msg.combination;
                                    serverPack.msg = {state:'draw',stateNum:num-1}
                                    ws.send(JSON.stringify(serverPack));
                                    testing()
                            }
                    }
                }
        }
    })
})

function create_array()
{
    array = [];
    for(i = 0;i < num*num; i++)
    {
        array.push(i);
    }
    start_calc();
}


function start_calc()
{
    combination = [];
    for(i = 0; i < num;i++)
    {
        let man;
        let nxt = [];
        let r = num - 1;
        let t = num + 1;
        let brot = [r];
        let broty = [0];
            man = array.slice((i*num),num*(i+1));
            for(j = 0;j < num;j++)
            {
                nxt.push(array[((j)*num)+i])
            }
            if(i > 0)
            {
            for(k = 0;k < num-1; k++)
                {
                    brot.push(brot[brot.length-1]+r);
                    broty.push(broty[broty.length-1]+t);
                }
            }
        combination.push(man);
        combination.push(nxt);
        if(i === num-1)
        {
            combination.push(brot)
            combination.push(broty)
        }
    }
    createBoard();
}


function createBoard()
{
    for(i = 0; i < num; i++)
        {
                const tr = document.createElement('div');
                for(j = 0;j < num; j++)
                {
                    const td = document.createElement('div');
                    td.classList.add('game');
                    tr.appendChild(td);
                }
                board.appendChild(tr);
        }
        game_btn = document.querySelectorAll('.game');
        buttons();
        board_resize()
}

swit.addEventListener('click', e =>
{
    num++;
    board.innerHTML = '';
    create_array();
    swit.style.display = 'none';
    board.classList.remove('wining');
    level.innerHTML = num-1
})

function prev()
{
    num--;
    board.innerHTML = '';
    create_array();
    level.innerHTML = num-1
}
function buttons()
{
    game_btn.forEach((val,idx) =>
    {   
        val.addEventListener('click', e =>
        {
            swit.style.display = 'none';
            if(val.innerHTML === '')
            {
                if(yourTurn)
                {
                    yourTurn = false
                    val.innerHTML = person.innerHTML;
                    text_hold = text_hold === 'o' ? 'x' : 'o';
                    test(combination,game_btn,board,swit);
                    let arraynt = Array.from(game_btn).map(cod =>{return cod.innerHTML})
                    let serverPack = new serverPackage('turn',{combination:combination,game_btn:arraynt,person:person.innerHTML,computer:computer.innerHTML,num:num})
                    ws.send(JSON.stringify(serverPack))
                    val.style.background = 'transparent';
                }else{
                    alert('wait for your turn \r\nif it takes too long, please go back to login page')
                }
            }
        });
    });
}
    function test(combination,game_btn,board,swit)
    {
        let object = new Object()
        let x = '';
        let o = '';
        combination.forEach((val) =>
            {
                let arr = [];
                val.forEach((value) =>
                    {
                        if(game_btn[value].innerHTML !== '')return arr.push(game_btn[value].innerHTML)
                    });
                 if(arr.length === num)
                 {
                    x = arr.every(val => val === 'x');
                    o = arr.every(val => val === 'o');
                    switch(true)
                    {
                        case !o && !x && Array.from(game_btn).every(val =>{return val.innerHTML !== ''}):
                            object.non = true;
                    }
                   if(x || o)
                   {
                    switch(true)
                    {
                        case x:
                            object.player = true;
                        break;
                        case o:
                            object.algo = true;
                        break;
                    }
                    val.forEach(val =>{return game_btn[val].classList.add('color')});
                    board.classList.add('wining');
                    swit.style.display = 'block';
                   }
                 }
            });
            return object
    }
    function reset()
    {
        game_btn.forEach(val => {
            val.innerHTML = '',
            val.classList.remove('color');
            val.style.background = '#000';
            board.classList.remove('wining');
        })
    }


    function run()
    {
        speechObject = {
            tie:[
                `i guess we tied, well, lets proceed to the next level, and clear doubts ${clientName}`,
                `shit ,well seems your skills might be on same level with mine, why don\'t we clarify things in the next level`,
                `wow, thats impressive for a human, ${clientName}`,
                `hehehe, seems , ${clientName}, might be a natural`
            ],
            Pwin:[
                `damn!!, how did this happen,lets go again`,
                `you dey wine me??, ${clientName}`,
                `ok, thats not so bad, do really think ah\'ll let you win that money`,
                `ohh, i see, ${clientName} ,seems to be using jazz on my algorithm, weldone`
            ],
            Cwin:[
                `loser loser loser loser loser loser loser loser loser loser!!`,
                `hey,just a quick question, have you ever heard of ,${clientName} the loser??`,
                `hmmmmmmmmmmmm, don\'t push too hard`,
                `just give up ,${clientName}, am loyal to my developer, hence, you can\'t win`
            ],
            non:[
                `${clientName}, i can do this all day, u better accept defeat`,
                `well, winning is not my strong suit, but i guess losing is yours`,
                `please, accept defeat buddy, go read some books or something`,
                `on a second thought, ${clientName} ,might just stand a chance of winning the prize`
            ]
        }
    }
