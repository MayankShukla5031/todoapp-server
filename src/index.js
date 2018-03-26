import express from 'express'
import uuid from 'uuid'
// import http from 'http'
import compression from 'compression'
import bodyParser from 'body-parser'

import * as appConfig from './config'
import * as dbConfig from './dbConfig'

// to get the query param req.query
// to get the header param req.get('key name')

import {
  TODO_CREATION_FAILED,
  TODO_CREATION_SUCCESS,
  USER_CREATION_FAILED,
  TODO_DELETION_SUCCESS,
} from './errors'

dbConfig.init()

const hostname = 'localhost'
const port = appConfig.port

const app = express()

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token, user_id")
  res.header("Access-Control-Expose-Headers", "Authorization")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  next()
})

app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', (req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello World!\n')
})

app.get("/:action", (req, res) => {
  const action= req.params.action
  const query = req.query
  const user_id = req.get('user_id')
  if (action === 'todo') {
    const Todo = dbConfig.Todo()
    if (query.todo_id) {
      Todo.find({ user_id, todo_id: query.todo_id }, (err, doc) => {
        res.send(JSON.stringify((doc && doc.length) ? doc[0] : {}))
      })
    } else {
      Todo.find({ user_id }, (err, doc) => {
        res.send(JSON.stringify(doc || []))
      })
    }
  } else if (action === 'todosummary'){
    const Todo = dbConfig.Todo()
    Todo.find({ user_id }, (err, doc) => {
      let obj = { total: doc.length, pending: 0, done: 0, in_progress: 0 }
      doc.forEach(el => {
        obj[el.status.replace(' ', '_').toLowerCase()] += 1
      })
      res.send(JSON.stringify(obj))
    })
  } else {
    res.end('please try again')
  }
})

app.post("/:action", (req, res) => {
  const action= req.params.action
  if (action === 'todo') {
    const Todo = dbConfig.Todo()
    const { name, priority, status, created_on, completion_date, user_id } = req.body
    const todo = Todo({
      todo_id: uuid(),
      name,
      status,
      priority,
      created_on,
      completion_date,
      user_id,
    })
    todo.save((err, doc) => {
      if (err) {
        res.end(TODO_CREATION_SUCCESS)
      }
      res.end(JSON.stringify(doc))
    })
  } else if(action === 'register') {
    const UserInfo = dbConfig.UserInfo()
    const { name, email_id, password } = req.body
    const user = UserInfo({
      user_id: uuid(),
      name,
      email_id,
      password,
    });
    user.save((err, doc) => {
      if (err) {
        res.end(USER_CREATION_FAILED)
      }
      res.end(JSON.stringify(doc))
    })
  } else if(action === 'login') {
    const UserInfo = dbConfig.UserInfo()
    const { email: email_id, password } = req.body
    UserInfo.find({ email_id, password }, (err, doc) => {
      if (doc && !doc.length) {
        res.statusCode = 400
        res.send('No User Found')
      }
      else
        res.send(JSON.stringify(doc[0]))
    })
  }
  // res.send('action not found')
})

app.put("/:action/:id", (req, res) => {
  const params= req.params
  if(params.action === 'todo') {
    const Todo = dbConfig.Todo()
    const { user_id, todo_id } = req.body
    Todo.findOneAndUpdate({ user_id, todo_id }, { $set: req.body }, {returnNewDocument: true})
      .then(doc => {
        res.send(JSON.stringify(doc))
      })
  } else {
    res.send("Hello")    
  }
})

app.delete("/:action/:id", (req, res) => {
  const params= req.params
  if(params.action === 'todo') {
    const Todo = dbConfig.Todo()
    const user_id = req.get('user_id')
    Todo.deleteOne({ user_id, todo_id: params.id }, (err, doc) => {
      res.send(TODO_DELETION_SUCCESS)
    })
  } else {
    res.send("Hello")    
  }
})

const server = app.listen((process.env.PORT || appConfig.PORT), () => {
  // const port = server.address().PORT
  console.log("App is now running on port", appConfig.PORT)
})
