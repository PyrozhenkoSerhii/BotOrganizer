import TelegramBot from 'node-telegram-bot-api'
import mongoose from 'mongoose'

import { token, db, errorMessage } from './config'
import { get, post, addTask, removeTask, editTask, getTask } from './utils/user'
import startKeyboard from './templates/keyboards/start'
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
    return bot.sendMessage(chat.id, errorMessage)
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


