// modules here

// package here
var express = require("express");
(mongoose = require("mongoose")),
  (ejs = require("ejs")),
  (bodyParser = require("body-parser"));
const fs = require("fs");
const multer = require("multer");
const path = require("path");
var router = express.Router();

// const here
const app = express();
app.use(bodyParser.json());

// app use set here
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("files"));

// const Comment = require('./models/commets');

const db = require("./models/blogdb");
const Blog = db.Blog;
const Comment = db.Comment;
let blogs;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

var upload = multer({ storage: storage });

Blog.find({}, function (err, data) {
  if (err) {
    console.log(err);
    res.status(500).send("An error occurred", err);
  } else {
    blogs = data;
  }
});

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

app.get("/compose", (req, res) => {
  res.render("compose", { title: "COMPOSE" });
});

app.post("/compose", upload.single("image"), (req, res) => {
  var obj = {
    title: req.body.title,
    content: req.body.content,
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

app
  .route("/posts/:topic")
  .get(async (req, res) => {
    let searchTitle = req.params.topic;
    let commentfiles = [];

    Blog.find({ title: searchTitle })
    .lean()
      .populate("comment")
      .exec((err, docs) => {
        if (err) {
          console.log(err);
        } else {

          // console.log(docs);
          let comment = docs;
          //  console.log(comment[0].comment);

          if (comment === undefined) {
            
            // comment[0].comment.forEach((element) => {
            //   commentfiles.push(element.comment);
              console.log('this is undefined');
            // });
          }
        }
      });
    Blog.find({}, function (err, data) {
      if (err) {

        res.status(500).send('An error occurred', err);
      } else {
        data.forEach((element) => {
          let postTitle = element.title;
          if (searchTitle == postTitle) {
            setTimeout(() => {

              res.render("post", {
                title: postTitle,
                content: element.content,
                // comment: commentfiles || '',
                image: element.img,
                id: element._id,
              });
            }, 1000);
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
      const comment = new Comment({ comment: req.body.comment });
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
