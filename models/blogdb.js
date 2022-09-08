const mongoose = require("mongoose");
// mongoose.connect("mongodb+srv://test123:test123@cluster0.m0y1zik.mongodb.net/blogdb");

mongoose.connect("mongodb://localhost:27017/newDB",  { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  console.log('connected')
});
var commentSchema = new mongoose.Schema(
  {
    comment: {
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

exports.Comment = Comment;

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true,
  },

  content: String,
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
