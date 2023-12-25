const http = require('http');
const express = require('express');
const app = express();
const websocket = require('ws');
const server = http.createServer(app);
const wss = new websocket.Server({server});
const path = require('path')
const port = process.env.PORT||8090;
const body = require('body-parser');
const urlEncoded = body.urlencoded({extended:false});
const sydney = require('./sydney.js');
let adminWeb = null;
let userSaveObject = new Object()
class createClientPack{
    constructor(purpose,msg){
        this.purpose = purpose;
        this.msg = msg
    }
}
let current = ''
server.listen(port,() =>{
    console.log('server is listening at port' + ` ${port}`)
})

app.use(express.static(path.join(__dirname,'/staticFiles')));
app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname,'/staticFiles/loginPage.html'))
})
app.get('/phill', (req,res) =>{
    current = 'admin'
    res.sendFile(path.join(__dirname,'/staticFiles/adminPage.html'))
})
app.post('/create',urlEncoded, (req,res) =>{
    current = req.body.username;
    switch(true)
    {
        case current.toLowerCase() !== '':
            res.sendFile(path.join(__dirname,'/staticFiles/chess.html'))
    }
})


wss.on('connection', ws =>{
    ws.current = current;
    let pack = new createClientPack('welcome',ws.current);
    ws.send(JSON.stringify(pack));
    ws.on('message', data =>{
        try{
            let newData = JSON.parse(data);
            switch(true)
            {
                case newData.purpose === 'turn':
                    let content = newData.msg
                    let sydneyChess = new sydney(content.combination,content.game_btn,content.person,content.computer,content.num);
                    let pack = new createClientPack('result',sydneyChess.returns)
                    ws.send(JSON.stringify(pack));
                break;
                case newData.purpose === 'adminLogin':
                    adminWeb = ws;
                    console.log(userSaveObject)
                    let packAd1 = new createClientPack('update',userSaveObject)
                    ws.send(JSON.stringify(packAd1))
                break;
                case newData.purpose === 'updateUser':
                    userSaveObject[`${ws.current}`] = newData.msg;
                    switch(true)
                    {
                        case adminWeb !== null:
                            let packAd2 = new createClientPack('update',userSaveObject)
                            adminWeb.send(JSON.stringify(packAd2))
                    }
            }
        }catch(err){
            console.log(err)
        }
    })
    ws.on('close', () =>{
        let newObject = new Object();
        const currentUser = ws.current
        Array.from(Object.keys(userSaveObject)).forEach(val =>{
            // console.log(val !== currentUser,val,currentUser)
            switch(true)
            {
                case val !== currentUser:
                    newObject[val] = userSaveObject[val]
            }
        })
        console.log(userSaveObject,'before')
        userSaveObject = newObject;
        console.log(userSaveObject,'after')
        let packAd1 = new createClientPack('update',userSaveObject);
        switch(true)
        {
            case adminWeb !== null:
                adminWeb.send(JSON.stringify(packAd1))
        }
    })
})