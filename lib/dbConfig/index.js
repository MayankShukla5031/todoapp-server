'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.UserInfo = exports.Todo = exports.ObjectId = exports.init = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _todoSchema = require('./todoSchema');

var _todoSchema2 = _interopRequireDefault(_todoSchema);

var _userInfoSchema = require('./userInfoSchema');

var _userInfoSchema2 = _interopRequireDefault(_userInfoSchema);

var _config = require('../config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var todoObject = void 0,
    userInfoObject = void 0,
    db = void 0,
    Schema = void 0,
    ObjectId = void 0;

var init = function init() {

	_mongoose2.default.connect(_config.mongodbUri);

	db = _mongoose2.default.connection;
	Schema = _mongoose2.default.Schema;
	exports.ObjectId = ObjectId = Schema.Types.ObjectId;

	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function () {
		console.log('db opened');
	});

	todoObject = _mongoose2.default.model('todoCollection', _todoSchema2.default);
	userInfoObject = _mongoose2.default.model('userCollection', _userInfoSchema2.default);
};

var Todo = function Todo() {
	return todoObject;
};

var UserInfo = function UserInfo() {
	return userInfoObject;
};

exports.init = init;
exports.ObjectId = ObjectId;
exports.Todo = Todo;
exports.UserInfo = UserInfo;