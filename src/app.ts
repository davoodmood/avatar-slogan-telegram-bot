// require('node-telegram-bot-api')
import TelegramBot from 'node-telegram-bot-api'
import axios from 'axios';
const fs = require('fs')
require('dotenv').config();
// Set the value below in the .env file with the Telegram token you receive from @BotFather
const token: string = `${process.env.BOT_TOKEN}`;
const bot: TelegramBot = new TelegramBot(token, {polling: true});
async function processImage(msg: TelegramBot.Message): Promise<void> {

    if(msg.text === `${process.env.BUTTON_A}`){
        bot.getUserProfilePhotos(msg.from?.id!).then(res => {
            res.photos.forEach((sizes: any): void => {
                for(let index = 0; index < sizes.length; index++) {
                    if(index !== 2) continue
                    const fileName= `${sizes[index].file_unique_id}`
                    axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${sizes[index].file_id}`)
                    .then(res => { 
                        axios({
                            method: 'get',
                            url: `https://api.telegram.org/file/bot${token}/${res.data.result.file_path}`,
                            responseType: 'arraybuffer'
                        })
                        .then(function (response) {
                            fs.writeFile(`./src/tmp/${fileName}.jpg`, response.data,(error: Error)=>{
                                console.log('Image saved!'); 
                                /* DO SOME ACTION WITH THE IMAGE */
                                bot.sendPhoto(
                                    msg.chat.id,
                                    `./src/tmp/${fileName}.jpg`,
                                    {caption : `Returned new updated image.`} 
                                );
                                console.log('Image Sent!'); 
                            })
                        });
                    })
                }
            })
        })
    }
}

bot.on('message', (msg) => {
    let Hi = "hi";
    console.log(msg)
    if (msg.text !== undefined && msg.text.toString().toLowerCase().indexOf(Hi)! === 0) {
    bot.sendMessage(msg.chat.id,`Hello dear ${msg.from?.first_name} `);
    }
    let btnA = `${process.env.BUTTON_A}`;
    if (msg.text?.indexOf(btnA) === 0) {
        processImage(msg);
    }
});
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `${process.env.WELCOME_MSG}`, {
        "reply_markup": {
            "keyboard": [[{
                text: `${process.env.BUTTON_A}`
            }]
        ]}
    });
    
});

bot.onText(/\/sendprofileimage/, (msg) => {
    processImage(msg);
});
