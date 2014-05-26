// var express = require('express');
// var router = express.Router();

/*
 * GET home page from AEBlog.
 */

exports.index = function(req, res){
  console.log("exports.index");
  res.render('index');
};

exports.partials = function (req, res) {
  console.log("exports.partials");
  var name = req.params.name;
  res.render('partials/' + name);
};

/* GET home page. */
/*
router.get('/', function(req, res) {
  console.log("get home page");
  res.render('index', { title : 'Some home page!!'});
  //res.sendfile('./views/index.jade');
  //res.send('./views/index.jade', { title: 'Express' });
});

router.get('/partials', function (req, res) {
  console.log("partials???");
  var name = req.params.name;
  console.log(name);
  res.render('partials/' + name);
});
*/

// /* GET list page. */
// router.get('*', function(req, res) {
  // res.send('./views/index.jade', { title: 'Here is the index page' });
// });
/* GET doclist page. */

/* 
router.get('/docList', function(req, res) {
    console.log("docList to hit MongoDB");
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        console.log('bunch of docs');
        console.log(docs[0]);
        //var docArray = docs.toArray();
        res.json({
          doclist: docs
        });
        // res.render('doclist', {
           // "doclist" : docs
        // });
    });
}); */

/* GET SpecificDoc page. */
// router.get('/htmlMD', function(req, res) {
    // console.log(req.params.Doc);
    // var html_dir = '.';
    // var doc = req.params.Doc;
    // res.sendfile(html_dir + doc);
// });


// module.exports = router;


/*
 * GET home page.  (following from AEBlog app)
 */

 /* 
exports.index = function(req, res){
  res.render('index');
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};
 */