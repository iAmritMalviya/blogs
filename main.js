var express = require("express")
mongoose = require("mongoose"),
ejs = require("ejs"),
bodyParser = require("body-parser")
const app = express()
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
mongoose.connect("mongodb://localhost/");
app.get("/", function (req, res) {
 res.render("home");
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
console.log("Server Has Started!");
});