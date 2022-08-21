const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/blogdb");


const commentSchema = mongoose.Schema({
    comment: String
  })

  exports.Comment = mongoose.model('Comment', commentSchema)
  
  const blogSchema = mongoose.Schema({
      title: {
        type: String,
        unique: true
      },
      content: String, 
      img: 
      {
        data: Buffer,
        type: String
      },
      comments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment"
        }
      ]
    })
    
    exports.Blog = mongoose.model('blog', blogSchema)