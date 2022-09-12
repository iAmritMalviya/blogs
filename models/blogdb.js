const mongoose = require("mongoose");
// mongoose.connect("mongodb+srv://test123:test123@cluster0.m0y1zik.mongodb.net/blogdb");
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');


// mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true, useUnifiedTopology: true }, err => {console.log('connected')});


mongoose.connect( process.env.DATABASE_URI || 'mongodb://localhost:27017/blogdb',  { useNewUrlParser: true, useUnifiedTopology: true }, err => {console.log('connected')});
var commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
    },
    username:
    {
      type: String,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);
// heroku config:set
// MONGODB_URI="mongodb+srv://Atlas-admin:redminote4@leaflix-east.6eqvyzm.mongodb.net/?retryWrites=true&w=majority"

exports.Comment = Comment;

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true,
  },

  content: String,
  author: String,
  img: {
    data: Buffer,
    contentType: String,
  },

  comment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});
const Blog = mongoose.model("Blog", blogSchema);

exports.Blog = Blog;


let userSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String
})
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);
exports.User = User;