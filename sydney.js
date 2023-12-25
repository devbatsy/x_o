class sydney
{
    constructor(combination,game_btn,person,computer,num)
    {
        this.combination = combination;
        this.game_btn = game_btn;
        this.person = person;
        this.computer = computer;
        this.num = num
        this.gameBtnChange = []
        this.returns = new Object()
        sydney.start(this)
    }
    static start(params)
    {
        let {combination,game_btn,person,computer,returns,gameBtnChange,num} = params;

        sydney_1()
        function sydney_1()
        {
            let trust_arr = [];
            let red = [];
            let to = 0;
            combination.forEach((val,idx) =>
                {
                    let r = 0;
                    val.forEach(value =>
                        {
                            if(game_btn[value] === person)
                            {
                                r++;
                            }
                        })
                       let y = val.some(valet =>{return game_btn[valet] === ''}) ;
                       if(y)
                       {
                            trust_arr.push(Math.floor((r/num)*100));
                            red.push(idx);
                       }
                });
                for(let i = 0;i < trust_arr.length;i++)
                    {
                        if(trust_arr[i] > to)to = trust_arr[i];
                        else {continue}
                    }
                    if(trust_arr.length !== 0)
                    {
                    for(let i = 0;i < combination[red[trust_arr.indexOf(to)]].length;i++)
                            {
                                if(game_btn[combination[red[trust_arr.indexOf(to)]][i]] === '')
                                {
                                    returns.answer = combination[red[trust_arr.indexOf(to)]][i]
                                    reshuffle();
                                    break;
                                }
                            }
                    }
                    
        }
    
        function reshuffle()
        {
            const temporal = [];
            let number = [];
           for(let i = 0; i < combination.length; i++)
           {
            number.push(i);
           }
            for(let i = 0;i < combination.length ;i++)
            {
                const hot = Math.floor(Math.random()*(number.length));
                let r = number.splice(hot,1)
                temporal.push(combination[r]);
            }
            combination = temporal;
            returns.combination = combination
        }
    }
}

module.exports = sydney