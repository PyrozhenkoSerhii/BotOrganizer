import TelegramBot from 'node-telegram-bot-api'
import mongoose from 'mongoose'
import moment from 'moment'

import { token, db, errorMessage } from './config'
import { get, post, addTask, removeTask, editTask, getTask, getByDay } from './utils/user'
import startKeyboard from './templates/keyboards/start'
import timeKeyboard from './templates/keyboards/time'
import approveKeyboard from './templates/keyboards/approve'
import * as callback from './utils/buttons'
import { taskTemplate, tasksTemplate } from './templates/html/task'

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

    return bot.sendMessage(chat.id, `What would you like to do?`, { reply_markup: { keyboard: startKeyboard } })
})


bot.onText(/\/tasks/, async ({ from: sender, chat }) => {
    const user = await get(sender.id)
    if (!user) return bot.sendMessage(chat.id, errorMessage)
    return bot.sendMessage(chat.id, tasksTemplate(user.tasks) || `There is no tasks`, { parse_mode: 'HTML' })
})


bot.onText(/\/task (.+)/, async ({ from: sender, chat }, [command, param]) => {
    const task = await getTask(sender.id, param)
    return bot.sendMessage(chat.id, taskTemplate(task) || `Task wasn't found`, { parse_mode: 'HTML' })
})


bot.onText(/\/today/, async ({ from: sender, chat }) => {
    const tasks = await getByDay(sender.id, 'today')
    if (!tasks || tasks === {}) return bot.sendMessage(chat.id, `There is no tasks for today!`)
    return bot.sendMessage(chat.id, tasksTemplate(tasks) || errorMessage, { parse_mode: 'HTML' })
})


bot.onText(/\/tomorrow/, async ({ from: sender, chat }) => {
    const tasks = await getByDay(sender.id, 'tomorrow')
    if (!tasks || tasks === {}) return bot.sendMessage(chat.id, `There is no tasks for tomorrow!`)
    return bot.sendMessage(chat.id, tasksTemplate(tasks) || errorMessage, { parse_mode: 'HTML' })
})


let tasks = {}
bot.onText(/\/create/, async ({ chat }) => {
    tasks[chat.id] = {}

    const { message_id: titleReply } = await bot.sendMessage(chat.id, 'How will you call it?', { reply_markup: { force_reply: true } })

    bot.onReplyToMessage(chat.id, titleReply, async ({ text }) => {
        tasks[chat.id].title = text

        const { message_id: contentReply } = await bot.sendMessage(chat.id, 'What do you need to do?', { reply_markup: { force_reply: true } })

        bot.onReplyToMessage(chat.id, contentReply, async ({ text }) => {
            tasks[chat.id].content = text

            bot.sendMessage(chat.id, 'When you need it to be done?', { reply_markup: { inline_keyboard: timeKeyboard } })
        })
    })
})


bot.on('callback_query', async (query) => {
    const id = query.message.chat.id
    let deadline = null

    if (query.data === callback.time.today || query.data === callback.time.tomorrow || query.data === callback.time.any) {
        if (query.data === callback.time.today) {
            deadline = moment().endOf('day')
        }
        if (query.data === callback.time.tomorrow) {
            deadline = moment().add(1, 'day').endOf('day')
        }

        tasks[id].deadline = deadline

        bot.sendMessage(id, taskTemplate(tasks[id]), { parse_mode: 'HTML' })
        bot.sendMessage(id, `Save following task?`, { reply_markup: { inline_keyboard: approveKeyboard } })
    } else {
        if (query.data === callback.approve.yes) {
            addTask(id, tasks[id])
            bot.sendMessage(id, `Saved!`)
        }
        if (query.data === callback.approve.no) {
            bot.sendMessage(id, `Rejected`)
        }
        tasks[chat.id] = null
    }
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


