const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const path = require('path')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const usermodel = require('./models/user');
//const postmodel= require('./models/post')

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");


app.get('/', (req, res) => {

    res.render('rend1');

});

app.get('/2nd', (req, res) => {
   
    res.render('rend2');

});


app.get('/profile',isLoggedin , (req,res)=>{
    console.log(req.user);
    res.render("rend2")
})

app.post('/register', async (req, res) => {

    let { email, password, username, name, age } = req.body;

    let user = await usermodel.findOne({ email });
    if (user) return res.status(500).send("<h3>user already exists!<h3>");


    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            // console.log(hash)
            let user = await usermodel.create({
                username,
                email,
                age,
                name,
                password: hash
            });
            let token = jwt.sign({ email: email, userid: user._id }, "shhh");
            res.cookie("token", token)
            res.send("<h3>registered!!<h3>")
        });
    });



});


app.post('/login', async (req, res) => {
    let { email, password } = req.body;

    let user = await usermodel.findOne({ email });
    if (!user) return res.status(500).send("<h3>something went wrong!<h3>");


    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, "shhh");
            res.cookie("token", token)
            res.status(500).send("<h3>you can log in<h3>");
        }
        else res.redirect("/2nd");
    })


})

app.get('/logout', (req, res) => {

    res.cookie("token", " ")
    res.redirect("/2nd")

    // res.redirect("/logout")
})

//for protected route//
function isLoggedin(req,res,next){

if(req.cookies.token === " ") res.send("u must be logged in!");
else{
    let data = jwt.verify(req.cookies.token , "shhh")
    req.user = data;
}
next();

}


app.listen(3000);
