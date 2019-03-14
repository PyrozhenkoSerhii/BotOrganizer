import TelegramBot from 'node-telegram-bot-api'
import mongoose from 'mongoose'
import moment from 'moment'

import { token, db, errorMessage } from './config'
import { get, post, addTask, removeTask, editTask, getTask } from './utils/user'
import startKeyboard from './templates/keyboards/start'
import timeKeyboard from './templates/keyboards/time'
import approveKeyboard from './templates/keyboards/approve'
import * as callback from './utils/buttons'

mongoose.connect(db.url).then(
    () => console.log(`Bot was connected to ${db.name} database`),
    (err) => console.log(`Error occured while connectiong to ${db.name} database: ${err}`)
)
mongoose.set('debug', (coll, method) => console.log(`[Mongoose] Path: /${coll}, method: ${method}`))

const bot = new TelegramBot(token, { polling: true })


bot.onText(/\/start/, async ({ from: sender, chat }) => {
    let user = await get(sender.id)
    if (!user) {
        user = await post(sender)
        if (!user) return bot.sendMessage(chat.id, errorMessage)
    }

    return bot.sendMessage(chat.id, `What would you like to do?`, {
        reply_markup: {
            keyboard: startKeyboard
        }
    })
})


bot.onText(/\/tasks/, async ({ from: sender, chat }) => {
    const user = await get(sender.id)
    if (!user) return bot.sendMessage(chat.id, errorMessage)
    return bot.sendMessage(chat.id, JSON.stringify(user.tasks, null, 4))
})


bot.onText(/\/today/, async ({ from: sender, chat }) => {
    return bot.sendMessage(chat.id, errorMessage)
})


bot.onText(/\/tomorrow/, async ({ from: sender, chat }) => {
    return bot.sendMessage(chat.id, errorMessage)
})


bot.onText(/\/help/, async ({ from: sender, chat }) => {
    return bot.sendMessage(chat.id, errorMessage)
})


bot.onText(/\/create/, async ({ from: sender, chat }) => {
    const task = {}

    const { message_id: titleReply } = await bot.sendMessage(chat.id, 'How we will call it?', { reply_markup: { force_reply: true } })

    bot.onReplyToMessage(chat.id, titleReply, async ({ text }) => {
        task.title = text

        const { message_id: contentReply } = await bot.sendMessage(chat.id, 'What do you need to do?', { reply_markup: { force_reply: true } })

        bot.onReplyToMessage(chat.id, contentReply, async ({ text }) => {
            task.content = text

            bot.sendMessage(chat.id, 'When you need it to be done?', { reply_markup: { inline_keyboard: timeKeyboard } })

            bot.on('callback_query', async ({ data }) => {
                if (data === callback.time.today) {
                    task.deadline = moment().endOf('day').fromNow()
                }
                if (data === callback.time.tomorrow) {
                    task.deadline = moment().add(1, 'day').endOf('day')
                }
                if (data === callback.time.custom) {
                    const { message_id: timeReply } = await bot.sendMessage(chat.id, 'Enter a time in format day:hour', { reply_markup: { force_reply: true } })

                    bot.onReplyToMessage(chat.id, timeReply, async ({ text }) => {
                        //TODO: time setup
                        const time = text.split(':')
                    })
                }

                bot.sendMessage(chat.id, `Your task looks like ${JSON.stringify(task)}. Is everything allright?`, { reply_markup: { inline_keyboard: approveKeyboard } })

                bot.on('callback_query', async ({ data }) => {
                    if (data === callback.approve.yes) {
                        bot.sendMessage(chat.id, `Saved!`)
                    }
                    if (data === callback.approve.no) {
                        bot.sendMessage(chat.id, `Rejected`)
                    }
                })
            })
        })
    })
})





bot.onText(/\/task (.+)/, async ({ from: sender, chat }, [command, param]) => {
    const task = await getTask(sender.id, param)
    if (!task || task === {}) return bot.sendMessage(chat.id, errorMessage)
    return bot.sendMessage(chat.id, JSON.stringify(task, null, 4))
})


bot.on('message', async ({ chat, from: sender, text }) => {
    switch (text) {
        case callback.start.all: {
            const user = await get(sender.id)
            if (!user) return bot.sendMessage(chat.id, errorMessage)
            return bot.sendMessage(chat.id, JSON.stringify(user.tasks, null, 4))
        }
        case callback.start.tomorrow: {
            break
        }
        case callback.start.today: {
            break
        }
        case callback.start.new: {
            break
        }
        case callback.start.cancel: {
            return bot.sendMessage(chat.id, `Canceled`, {
                reply_markup: {
                    remove_keyboard: true
                }
            })
        }
    }
})


