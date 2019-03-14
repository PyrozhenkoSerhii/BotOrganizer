import mognoose, { Schema } from 'mongoose'

exports.Task = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        maxlength: [40, 'Max length of title is 40']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        maxlength: [300, 'Max length of content is 300']
    },
    severity: {
        type: String,
        default: 'medium',
        enum: ['low', 'medium', 'high']
    },
    point: {
        type: Date,
        required: [true, 'Date is required']
    },
    done: {
        type: Boolean,
        default: false
    }
})