
const express = require('express');
const app = express();
const session = require('express-session');
const userRouter = require('./routes/userRouter'); // Ensure correct path
const adminrouter=require('./routes/adminrouter');
const { router } = require('./controllers/admincontroller');
const multer=require('multer');






app.use(express.static('public'))


app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use('/', userRouter); // Use the userRouter
app.use('/',adminrouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

