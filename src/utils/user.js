import _last from 'lodash/last'
import _find from 'lodash/find'

import User from '../models/User'
import wrap from './asyncWrapper'


exports.get = wrap(async (id) => {
    return await User.findOne({ _id: id })
})

exports.post = wrap(async (from) => {
    const user = new User({
        _id: from.id,
        name: {
            first: from.first_name,
            last: from.last_name
        },
        tasks: []
    })

    const validationError = user.validateSync()
    if (validationError) {
        console.log(validationError.errors)
        return null
    }

    return await user.save()
})

exports.addTask = wrap(async (userId, task) => {
    const user = await User.findOne({ id: userId })

    if (!user) {
        console.log(`User not found`)
        return null
    }

    user.tasks.push(task)

    const validationError = _last(user.tasks).validateSync()
    if (validationError) {
        console.log(validationError.errors)
        return null
    }

    return await user.save()
})


exports.removeTask = wrap(async (userId, taskId) => {
    const user = await User.findOne({ id: userId })

    if (!user) {
        console.log(`User not found`)
        return null
    }

    user.tasks.id(taskId).remove()

    return await user.save()
})


exports.editTask = wrap(async (userId, task) => {
    const user = await User.findOne({ id: userId })

    if (!user) {
        console.log(`User not found`)
        return null
    }

    const existingTask = user.tasks.id(task.id)
    existingTask.set(task)

    return await user.save()
})


exports.getTask = wrap(async (userId, taskTitle) => {
    const user = await User.findOne({ id: userId })

    if (!user) {
        console.log(`User not found`)
        return null
    }

    return _find(user.tasks, { title: taskTitle })
})


