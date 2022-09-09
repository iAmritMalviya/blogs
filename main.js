// modules here

// package here
require('dotenv').config();
var express = require("express");
const session = require("express-session");
(mongoose = require("mongoose")),
  (ejs = require("ejs")),
  (bodyParser = require("body-parser"));
  const fs = require("fs");
const multer = require("multer");
const path = require("path");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
// var router = express.Router();

// const here
const app = express();
app.use(bodyParser.json());

// app use set here
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("files"));
app.use(
  session({
    secret: "password",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 600000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// const Comment = require('./models/commets');

const db = require("./models/blogdb");
const Blog = db.Blog;
const Comment = db.Comment;
const User = db.User;
let username;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
  done(null, user._id);
  // if you use Model.id as your idAttribute maybe you'd want
  // done(null, user.id);
});

passport.deserializeUser(function(id, done) {
User.findById(id, function(err, user) {
  done(err, user);
});
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/compose",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
  
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


app.use(function (req, res, next) {
  res.locals.session = req.session;

  next();

  
});

// routes here
app.get("/", function (req, res) {
  Blog.find({"title": {$ne: ''} }, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.render("home", { title: "HOME", data: data});
    
    }
  });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] }));

  app.get('/auth/google/compose', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.session.loggedin = true;
    res.redirect('/');
  });

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    User.register(
      { username: req.body.username },
      req.body.password,
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          console.log(result);
          username = result.username;
          passport.authenticate("local")(req, res, function () {
            req.session.loggedin = true;


            res.redirect("/");
          });
        }
      }
    );
  });
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    let user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, (err) => {
      if (err) res.send("password or username is incorrect");
      else {
        passport.authenticate("local")(req, res, function () {
          username = req.user.username;
          req.session.loggedin = true;

          res.redirect("/");
        });
      }
    });
  });

app
  .route("/compose")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("compose", { title: "COMPOSE" });
    } else {
      res.redirect("/login");
    }
  })
  .post(upload.single("image"), (req, res) => {
    var obj = {
      title: req.body.title,
      content: req.body.content,
      author: username,
      img: {
        data: fs.readFileSync(
          path.join(__dirname + "/uploads/" + req.file.filename)
        ),
        contentType: "image/png",
      },
    };

    let blog = Blog(obj);
    blog.save();

    res.redirect("back");
  });
app.get("/logout", function (req, res) {
  req.logout((err) => {
    if (err) console.log(err);
    else res.redirect("/");
  });
});

app
  .route("/posts/:topic")
  .get(async (req, res) => {
    let searchTitle = req.params.topic;
    let commentfiles = [];

    Blog.find({ title: req.params.topic })
      .lean()
      .populate("comment")
      .exec((err, docs) => {
        if (err) {
          console.log(err);
        } else {
          try {
            docs[0].comment.forEach((element) => {
              commentfiles.push(element);
            });
          } catch (error) {
            console.log(error);
          }
        }
      });

    Blog.find({}, function (err, data) {
      if (err) {
        res.status(500).send("An error occurred", err);
      } else {
        data.forEach((element) => {
          let postTitle = element.title;
          if (searchTitle == postTitle) {
            setTimeout(() => {
              res.render("post", {
                title: postTitle,
                content: element.content,
                comment: commentfiles,
                image: element.img,
                id: element._id,
              });
            }, 500);
          }
        });
      }
    });
  })
  .post(async (req, res) => {
    deleteTitle = req.body.delete;
    if (deleteTitle != undefined) {
      Blog.deleteOne({ title: deleteTitle })
        .then(function () {
          console.log("blog has been deleted");
          res.redirect("/");
        })
        .catch(function (err) {
          console.log(err);
        });
    } else {
      let commentObj = {
        comment: req.body.comment,
        username: username,
      };

      const comment = new Comment(commentObj);
      await comment.save();
      await Blog.findOneAndUpdate(
        { _id: req.body._id },
        { $push: { comment } }
      );

      res.redirect("back");
    }
  });

//   router.post("/do-comment", async (req,res) =>{
//     const comment = new Comment({name:req.body.name, email:req.body.email, comment:req.body.comment});
//     await comment.save();
//     await Blog.findOneAndUpdate({_id:req.body._id}, {$push: {comment}});
//     res.send("Comment was added successfully");
// })

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
