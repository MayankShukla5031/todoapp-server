import mongoose from 'mongoose'

import todoSchema from './todoSchema'
import userInfoSchema from './userInfoSchema'
import { mongodbUri } from '../config'

let todoObject, userInfoObject, db, Schema, ObjectId

const init = () => {

	mongoose.connect(mongodbUri)

	db = mongoose.connection
	Schema = mongoose.Schema
	ObjectId = Schema.Types.ObjectId

	db.on('error', console.error.bind(console, 'connection error:'))
	db.once('open', () => {console.log('db opened')})

	todoObject = mongoose.model('todoCollection', todoSchema)
	userInfoObject = mongoose.model('userCollection', userInfoSchema)
}

const Todo = () => todoObject

const UserInfo = () => userInfoObject

export {
	init,
	ObjectId,
	Todo,
	UserInfo,
}
