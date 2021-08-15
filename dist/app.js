"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const axios_1 = __importDefault(require("axios"));
const jimp_1 = __importDefault(require("jimp"));
const fs = require('fs');
require('dotenv').config();
// Set the value below in the .env file with the Telegram token you receive from @BotFather
const token = `${process.env.BOT_TOKEN}`;
const bot = new node_telegram_bot_api_1.default(token, { polling: true });
async function processImage(msg) {
    var _a;
    let bannerPosition;
    switch (msg.text) {
        case process.env.BANNER_CENTER:
            bannerPosition = 'center-bottom';
            break;
        case process.env.BANNER_RIGHT:
            bannerPosition = 'right-bottom';
            break;
        case process.env.BANNER_LEFT:
            bannerPosition = 'left-bottom';
            break;
        default:
            bannerPosition = 'center-bottom';
            break;
    }
    bot.getUserProfilePhotos((_a = msg.from) === null || _a === void 0 ? void 0 : _a.id).then(res => {
        res.photos.forEach((sizes) => {
            for (let index = 0; index < sizes.length; index++) {
                if (index !== 2)
                    continue;
                const fileName = `${sizes[index].file_unique_id}-${parseInt((new Date('2012.08.10').getTime() / 1000).toFixed(0))}`;
                axios_1.default.get(`https://api.telegram.org/bot${token}/getFile?file_id=${sizes[index].file_id}`)
                    .then(res => {
                    axios_1.default({
                        method: 'get',
                        url: `https://api.telegram.org/file/bot${token}/${res.data.result.file_path}`,
                        responseType: 'arraybuffer'
                    })
                        .then(function (response) {
                        fs.writeFile(`${__dirname}/tmp/${fileName}.jpg`, response.data, (error) => {
                            jimp_1.default.read(`${__dirname}/tmp/${fileName}.jpg`, (err, fir_img) => {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    jimp_1.default.read(`${__dirname}/overlays/${bannerPosition}.png`, (err, sec_img) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            fir_img.composite(sec_img, 0, 0);
                                            fir_img.write(`${__dirname}/tmp/${fileName}.jpg`);
                                            fir_img.write(`${__dirname}/tmp/${fileName}.jpg`, () => {
                                                bot.sendPhoto(msg.chat.id, `${__dirname}/tmp/${fileName}.jpg`, { caption: `${process.env.RETURNED_MESSAGE}` })
                                                    .then(() => {
                                                    // Delete the file in tmp folder
                                                    fs.unlink(`${__dirname}/tmp/${fileName}.jpg`, (err) => {
                                                        if (err) {
                                                            console.error(err);
                                                            return;
                                                        }
                                                        //edited file removed
                                                    });
                                                });
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    });
                });
            }
        });
    });
}
bot.on('message', (msg) => {
    var _a;
    let btnA = `${process.env.BUTTON_CALL_TO_ACTION}`;
    if ((_a = msg.text) === null || _a === void 0 ? void 0 : _a.includes(btnA)) {
        processImage(msg);
    }
});
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `${process.env.WELCOME_MSG}`, {
        "reply_markup": {
            "keyboard": [[
                    {
                        text: `${process.env.BANNER_LEFT}`
                    },
                    {
                        text: `${process.env.BANNER_CENTER}`
                    },
                    {
                        text: `${process.env.BANNER_RIGHT}`
                    },
                ]
            ]
        }
    });
});
bot.onText(/\/sendprofileimage/, (msg) => {
    msg.text = `${process.env.BUTTON_CALL_TO_ACTION}`;
    processImage(msg);
});
