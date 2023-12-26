
const express = require('express');
const app = express();
var path = require('path')
const session = require('express-session');
const userRouter = require('./routes/userRouter');
const adminrouter = require('./routes/adminrouter');
const { router } = require('./controllers/admincontroller');
const nocache = require('nocache')
app.use(nocache())
app.use(express.json())


app.use(express.static(path.join(__dirname, '/public')))


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use('/', userRouter);
app.use('/', adminrouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

