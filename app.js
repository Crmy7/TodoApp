var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
dotenv.config();


require('./models/models')


var indexRouter = require('./routes/index');
var tasksRouter = require('./routes/tasks');
var tasksRouterV2 = require('./routes/tasksv2');
var usersRouter = require('./routes/users');
var usersRouterv2 = require('./routes/usersv2');


var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tasks', tasksRouter);
app.use('/V2/tasks', tasksRouterV2);
app.use('/users', usersRouter);
app.use('/V2/users', usersRouterv2);


module.exports = app;
