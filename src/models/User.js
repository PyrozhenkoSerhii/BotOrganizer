import mongoose, { Schema } from 'mongoose'

import { Task } from './Task'


const UserSchema = new Schema({
    _id: {
        type: Number,
        requred: [true, 'Id is required']
    },
    name: {
        first: {
            type: String,
            required: [true, 'First name is required']
        },
        last: {
            type: String,
            required: [true, 'Last name is required']
        }
    },
    tasks: [Task]
})


module.exports = mongoose.model('User', UserSchema)