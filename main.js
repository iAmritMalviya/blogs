const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");

mongoose.connect("mongodb://localhost:27017/blogdb");
// mongoose.connect('mongodb://localhost:27017/user');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "thisis me",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//mongoose create schema
const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const userschema = new mongoose.Schema({
  username: String,
  password: String,
});
userschema.plugin(passportLocalMongoose);
const User = mongoose.model("user", userschema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Blog = mongoose.model("blog", blogSchema);
let blogs;
let status = 'LOGIN';
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/", function (req, res) {

        Blog.find({}, function (err, data) {
          if (err) {
            console.log(err);
          } else {
            blogs = data;
            res.render("home", { title: "HOME", data: data, status: status });
          }
        });
      
  
});

app.get("/posts/:topic", (req, res) => {
  let searchedTitle = _.lowerCase(req.params.topic);
  console.log(searchedTitle);
  blogs.forEach((element) => {
    let postTitle = _.lowerCase(element.title);
    if (postTitle == searchedTitle) {
      res.render("post", { title: element.title, content: element.content });
    }
  });
});

app.get("/compose", function (req, res) {
    if (req.isAuthenticated()) {
        status = 'LOGOUT'
        res.render("compose", { title: "COMPOSE", status: status });
    }
    else
    {   status= 'login'
        res.redirect('/login')
    }

 
});
app.get('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err);
            
        }
        else
        {
            console.log('logout out');
            res.redirect('/')
            
        }
    })
})

app.post("/register", function (req, res) {
  let username = req.body.username;
  let password = req.body.password;
  User.register({ username: username }, password, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      passport.authenticate("local")(req, res, function () {
        res.redirect("/home");
      });
    }
  });
});

app.post('/login', function (req, res) {

    let user = new User({
        username : req.body.username,
        password: req.body.password
    })
    req.login(user, function(err){
        if (err) {
            console.log(err)
        }
        else{
            passport.authenticate('local')(req, res, function () {
                res.redirect('/compose');
            })
        }
    })
})

app.post("/compose", function (req, res) {
  let title = req.body.title;
  let content = req.body.content;
  const blog = new Blog({
    title: title,
    content: content,
  });
  blog.save();

  res.redirect("/");
});

app.post("/posts/:topic", function (req, res) {
  console.log("this is topic" + req.params.topic);

  let comment = req.body.comment;
  console.log(comment);
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("The server has started at 3000");
});
