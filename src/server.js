import express from 'express'
import mongoose from 'mongoose'

import { db } from './config'


const server = express()

const port = process.env.PORT || 8080

server.listen(port, () => console.log(`Server is running on port ${port}`))

mongoose.connect(db.url).then(
    () => console.log(`Bot was connected to ${db.name} database`),
    (err) => console.log(`Error occured while connectiong to ${db.name} database: ${err}`)
)
mongoose.set('debug', (coll, method) => console.log(`[Mongoose] Path: /${coll}, method: ${method}`))


import './bot'