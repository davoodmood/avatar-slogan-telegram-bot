import TelegramBot from 'node-telegram-bot-api'
import axios from 'axios';
import Jimp from 'jimp';
const fs = require('fs');
require('dotenv').config();
// Set the value below in the .env file with the Telegram token you receive from @BotFather
const token: string = `${process.env.BOT_TOKEN}`;
const bot: TelegramBot = new TelegramBot(token, {polling: true});
async function processImage(msg: TelegramBot.Message): Promise<void> {
    let bannerPosition: string;
    switch (msg.text) {
        case process.env.BANNER_CENTER:
            bannerPosition = 'center-bottom'
            break;
        case process.env.BANNER_RIGHT:
            bannerPosition = 'right-bottom'
            break;
        case process.env.BANNER_LEFT:
            bannerPosition = 'left-bottom'
            break;
        case process.env.CIRCLE_WHITE:
            bannerPosition = 'circle-white'
            break;
        case process.env.CIRCLE_RED:
            bannerPosition = 'circle-red'
            break;
        case process.env.CIRCLE_YELLOW:
            bannerPosition = 'circle-yellow'
            break;
        default:
            bannerPosition = 'center-bottom'
            break;
    }
    bot.getUserProfilePhotos(msg.from?.id!).then(res => {
        bot.sendMessage(msg.chat.id,`${process.env.LOADING_TEXT}`);
        res.photos.forEach((sizes: any): void => {
            for(let index = 0; index < sizes.length; index++) {
                if(index !== 2) continue
                const fileName= `${sizes[index].file_unique_id}-${parseInt((new Date().getTime() / 1000).toFixed(0))}`
                axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${sizes[index].file_id}`)
                .then(res => { 
                    axios({
                        method: 'get',
                        url: `https://api.telegram.org/file/bot${token}/${res.data.result.file_path}`,
                        responseType: 'arraybuffer'
                    })
                    .then(function (response) {
                        fs.writeFile(`${__dirname}/tmp/${fileName}.jpg`, response.data,(error: Error)=>{
                            Jimp.read(`${__dirname}/tmp/${fileName}.jpg`, (err, fir_img) => {
                                if(err) {
                                    console.log(err);
                                } else {
                                    Jimp.read(`${__dirname}/../assets/overlays/${bannerPosition}.png`, (err, sec_img) => {
                                        if(err) {
                                            console.log(err);
                                        } else {
                                            fir_img.composite(sec_img, 0, 0);
                                            fir_img.write(`${__dirname}/tmp/${fileName}.jpg`);
                                            fir_img.write(`${__dirname}/tmp/${fileName}.jpg`, () =>{
                                                bot.sendPhoto(
                                                    msg.chat.id,
                                                    `${__dirname}/tmp/${fileName}.jpg`,
                                                    {caption : `${process.env.RETURNED_MESSAGE}`} 
                                                )
                                                .then(() => {
                                                    // Delete the file in tmp folder
                                                    fs.unlink(`${__dirname}/tmp/${fileName}.jpg`, (err: Error) => {
                                                        if (err) {
                                                            console.error(err)
                                                            return
                                                        }
                                                        //edited file removed
                                                        })
                                                })
                                            });
                                        }
                                    })
                                }
                            });
                        })
                    });
                })
            }
        })
    })
}

bot.on('message', (msg) => {
    let btnA = `${process.env.BUTTON_CALL_TO_ACTION}`;
    if (msg.text?.includes(btnA)) {
        processImage(msg);
    }
});
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `${process.env.WELCOME_MSG}`, {
        "reply_markup": {
            "keyboard": [
            [                
                {
                    text: `${process.env.BANNER_LEFT}`
                },
                {
                    text: `${process.env.BANNER_CENTER}`
                },
                {
                    text: `${process.env.BANNER_RIGHT}`
                },
            ],
            [                
                {
                    text: `${process.env.CIRCLE_WHITE}`
                },
                {
                    text: `${process.env.CIRCLE_RED}`
                },
                {
                    text: `${process.env.CIRCLE_YELLOW}`
                },
            ]
        ]}
    });
    
});

// Adding commands
bot.onText(/\/sendprofileimage/, (msg) => {
    msg.text = `${process.env.BUTTON_CALL_TO_ACTION}`;
    processImage(msg);
});
