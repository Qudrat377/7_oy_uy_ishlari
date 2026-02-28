import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Bot, BotDocument } from "src/schema/bot.schema";
import TelegramBot from "node-telegram-bot-api"

@Injectable()
export class BotService {
    private bot: TelegramBot

    private readonly teacherId: number = Number(process.env.TEACHER_ID as string)
    constructor(@InjectModel(Bot.name) private botModel: Model<BotDocument>)  {
        this.bot = new TelegramBot(process.env.BOT_TOKEN as string, {polling: true})

        // commands 
        this.bot.setMyCommands([
            {
                command: "/start", description: "botdan ro'yxatdan o'tish"
            },
            {
                command: "/commands", description: "botdan ro'yxatdan o'tish"
            }
        ])

        // start 
        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.from?.id as number

            if(chatId === this.teacherId) {
                this.bot.sendMessage(chatId, "Siz ustoz sifatida belgilangansiz")
            }

            const foundedUser = await this.botModel.findOne({chatId})

            if(!foundedUser) {
                await this.botModel.create({name: msg.from?.first_name || "unknown", chatId})
                this.bot.sendMessage(chatId, "Botdan foydalanishingiz mumkin")
                return this.bot.sendMessage(this.teacherId, "Yangi foydalanuvchi")
            }

            return this.bot.sendMessage(chatId, "Botdan oldin ro'yxatdan o'tkansiz")
        })

        this.bot.on("message", async (msg) => {
            const chatId = msg.from?.id as number

            const foundedUser = await this.botModel.findOne({chatId})

            if(!foundedUser) {
                this.bot.sendMessage(chatId, "Iltimos /start buyrug'ini bosing")
                return
            }

            if (msg.text === "/commands") {
                this.bot.sendMessage(chatId, "Amallar", {
                    reply_markup: {
                        keyboard: [
                            
                            [
                                {
                                    text: "Photo"
                                },
                                {
                                    text: "Video"
                                },
                                {
                                    text: "Poll",
                                    request_poll: {
                                        type: "quiz"
                                    }
                                }
                            ],
                            [
                                {
                                    text: "Contact",
                                    request_contact: true
                                },
                                {
                                    text: "Location",
                                    request_location: true
                                }
                            ]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                })
            }
            if (msg.contact) {
                this.bot.sendContact(this.teacherId, `${msg.contact.phone_number}`, `${msg.from?.first_name}`)
            }

            if (msg.location) {
                this.bot.sendMessage(this.teacherId, `${chatId}-${msg.from?.first_name}`)
                this.bot.sendLocation(this.teacherId, msg.location.latitude, msg.location.longitude)
            }

            if (msg.text && !["/start", "/commands"].includes(msg.text)) {
                // ustozga murojat 
                if(chatId !== this.teacherId) {
                    this.bot.sendMessage(this.teacherId, `${chatId}-${msg.from?.first_name}:${msg.text}`)
                }
                
                

                // studentga murojat 
                if(chatId === this.teacherId && msg.reply_to_message) {
                    const studentdId: number = parseInt(msg.reply_to_message?.text?.split("-")[0] as string)
                    this.bot.sendMessage(studentdId, `${msg.text}`)
                }
            }
        })






    }
}
