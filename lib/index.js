'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _config = require('./config');

var appConfig = _interopRequireWildcard(_config);

var _dbConfig = require('./dbConfig');

var dbConfig = _interopRequireWildcard(_dbConfig);

var _errors = require('./errors');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

dbConfig.init();

// to get the query param req.query
// to get the header param req.get('key name')

// import http from 'http'


var hostname = 'localhost';
var port = appConfig.port;

var app = (0, _express2.default)();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token, user_id");
  res.header("Access-Control-Expose-Headers", "Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.use((0, _compression2.default)());
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!\n');
});

app.get("/:action", function (req, res) {
  var action = req.params.action;
  var query = req.query;
  var user_id = req.get('user_id');
  if (action === 'todo') {
    var Todo = dbConfig.Todo();
    if (query.todo_id) {
      Todo.find({ user_id: user_id, todo_id: query.todo_id }, function (err, doc) {
        res.send(JSON.stringify(doc && doc.length ? doc[0] : {}));
      });
    } else {
      Todo.find({ user_id: user_id }, function (err, doc) {
        res.send(JSON.stringify(doc || []));
      });
    }
  } else if (action === 'todosummary') {
    var _Todo = dbConfig.Todo();
    _Todo.find({ user_id: user_id }, function (err, doc) {
      var obj = { total: doc.length, pending: 0, done: 0, in_progress: 0 };
      doc.forEach(function (el) {
        obj[el.status.replace(' ', '_').toLowerCase()] += 1;
      });
      res.send(JSON.stringify(obj));
    });
  } else {
    res.end('please try again');
  }
});

app.post("/:action", function (req, res) {
  var action = req.params.action;
  if (action === 'todo') {
    var Todo = dbConfig.Todo();
    var _req$body = req.body,
        name = _req$body.name,
        status = _req$body.status,
        created_on = _req$body.created_on,
        completion_date = _req$body.completion_date,
        user_id = _req$body.user_id;

    var todo = Todo({
      todo_id: (0, _uuid2.default)(),
      name: name,
      status: status,
      created_on: created_on,
      completion_date: completion_date,
      user_id: user_id
    });
    todo.save(function (err, doc) {
      if (err) {

        res.end(_errors.TODO_CREATION_SUCCESS);
      }
      res.end(JSON.stringify(doc));
    });
  } else if (action === 'register') {
    var UserInfo = dbConfig.UserInfo();
    var _req$body2 = req.body,
        _name = _req$body2.name,
        email_id = _req$body2.email_id,
        password = _req$body2.password;

    var user = UserInfo({
      user_id: (0, _uuid2.default)(),
      name: _name,
      email_id: email_id,
      password: password
    });
    user.save(function (err, doc) {
      if (err) {
        res.end(_errors.USER_CREATION_FAILED);
      }
      res.end(JSON.stringify(doc));
    });
  } else if (action === 'login') {
    var _UserInfo = dbConfig.UserInfo();
    var _req$body3 = req.body,
        _email_id = _req$body3.email,
        _password = _req$body3.password;

    _UserInfo.find({ email_id: _email_id, password: _password }, function (err, doc) {
      if (doc && !doc.length) {
        res.statusCode = 400;
        res.send('No User Found');
      } else res.send(JSON.stringify(doc[0]));
    });
  }
  // res.send('action not found')
});

app.put("/:action/:id", function (req, res) {
  var params = req.params;
  if (params.action === 'todo') {
    var Todo = dbConfig.Todo();
    var _req$body4 = req.body,
        user_id = _req$body4.user_id,
        todo_id = _req$body4.todo_id;

    Todo.findOneAndUpdate({ user_id: user_id, todo_id: todo_id }, { $set: req.body }, { returnNewDocument: true }).then(function (doc) {
      res.send(JSON.stringify(doc));
    });
  } else {
    res.send("Hello");
  }
});

app.delete("/:action/:id", function (req, res) {
  var params = req.params;
  if (params.action === 'todo') {
    var Todo = dbConfig.Todo();
    var user_id = req.get('user_id');
    Todo.deleteOne({ user_id: user_id, todo_id: params.id }, function (err, doc) {
      res.send(_errors.TODO_DELETION_SUCCESS);
    });
  } else {
    res.send("Hello");
  }
});

// console.log('process.env', process.env)

var server = app.listen(process.env.PORT || appConfig.PORT, function () {
  // const port = server.address().PORT
  console.log("App is now running on port", appConfig.PORT);
});