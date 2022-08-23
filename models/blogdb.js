const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://test123:test123@cluster0.m0y1zik.mongodb.net/blogdb");


const commentSchema = mongoose.Schema({
    comment: String
  })

  exports.Comment = mongoose.model('Comment', commentSchema)
  
  const blogSchema = new mongoose.Schema({
      title: {
        type: String,
        unique: true
      },
      content: String, 

      img: 
      {
        data: Buffer,
        contentType: String
      },
      comments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment"
        }
      ]
    })
    
    exports.Blog = mongoose.model('blog', blogSchema)