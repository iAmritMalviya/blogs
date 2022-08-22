// modules here

// package here
var express = require("express");
(mongoose = require("mongoose")),
  (ejs = require("ejs")),
  (bodyParser = require("body-parser"));
const multer = require("multer");

var fs = require("fs");
var path = require("path");
// const here
const app = express();

// app use set here
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.static('files'))

// const Comment = require('./models/commets');

const db = require("./models/blogdb");
const { countBy } = require("lodash");
const Blog = db.Blog;
const Comment = db.Comment;
let blogs;

Blog.find({}, function (err, data) {
  if (err) {
    console.log(err);
    res.status(500).send("An error occurred", err);
  } else {
    blogs = data;
  }
});

const storage = multer.diskStorage({
  destination: "./files/images",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).single('image');

// routes here
app.get("/", function (req, res) {
  Blog.find({}, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      blogs = data;

      res.render("home", { title: "HOME", data: data });
    }
  });
});

app
  .route("/compose")
  .get((req, res) => {
    res.render("compose", { title: "COMPOSE" });
  })
  .post((req, res) => {
    upload(req, res, (err) => {
      
      if (err) {
        console.log(err);
      } else {
        const newImage = new Blog({
          title: req.body.title,
          content: req.body.content,
          img: {
            data: req.file.filename,
            contentType: "image/png",
          },
        });
        newImage
          .save()
          .then(() => {
            console.log("successs");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });

    res.redirect("/");
  });

app
  .route("/posts/:topic")
  .get((req, res) => {
    let searchTitle = req.params.topic;

    blogs.forEach((element) => {
      let postTitle = element.title;
      if (searchTitle == postTitle) {
        console.log("match found");
        res.render("post", { title: postTitle, content: element.content });
      }
    });
  })
  .post((req, res) => {
    deleteTitle = req.body.title;
    console.log(deleteTitle);

    Blog.deleteOne({ title: deleteTitle })
      .then(function () {
        console.log("blog has been deleted");
        res.redirect("/");
      })
      .catch(function (err) {
        console.log(err);
      });

    // res.redirect('back')
  });

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
