const createError = require('http-errors');
const express = require('express');
const path = require('path');
const debug = require('debug')('uploadfile:server');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multer = require('multer');
const serverIndex = require('serve-index');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// Storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/uploads')
  },
  filename: (req, file, callback) => {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage });

const userRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/ftp', express.static('public'), serverIndex('public', { 'icons': true }));

app.get('/', (req,res) => res.send('Hello '));
app.post('/testUpload', upload.single('file', (req, res) => {
  debug(req.file);
  console.log('storage location is ', req.hostname + '/'+req.file.path);
  return res.send(req.file)
}));

app.use('/', indexRouter);

app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
