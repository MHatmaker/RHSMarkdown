var fs = require("fs");
var marked = require("marked");
var path = require('path');
var pygmentize = require('pygmentize-bundled');

// New Code
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/nodetest1');

/* GET doclist page. */
exports.getDocs = function(req, res) {
    console.log("docList to hit MongoDB");
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        console.log('bunch of docs');
        console.log(docs[0]);
        res.json({
          doclist: docs
        });
    });
};


exports.getDoc = function(req, res) {

    console.log('get SpecificDoc, md simple');
    console.log('%s %s %s', req.method, req.url, req.path);
    console.log('req.params.id is %s', req.params.id); //('id'));
    var collection = db.get('usercollection');
    collection.findById(req.params.id,function(err, doc){
		if (err) res.json(500, err);
		else if (doc){
            console.log("docPath : " + doc.url);
            var html_dir = '.\\';
            fs.readFile( path.join(html_dir, doc.url), function (err, data) {
                if (err) {
                    //throw err;
                    console.log("error");
                    console.log(err);
                }
                // console.log(data.toString());
                // res.json({ Doc: doc.url, DocContents: data.toString() })
                var mrked = marked(data.toString());   //working on 5/18
                // var mrked =  '<xmp theme="united" style="display:none;">' + data.toString() + '</xmp>';
                // var mrked =  '<xmp theme="united" style="display:none;">' + data.toString() + '</xmp><script src="http://strapdownjs.com/v/0.2/strapdown.js"></script>';
                // console.log(mrked);
                res.json({ Doc: doc.url, DocContents: mrked })
            })  ;
            

        
            //res.json(docPath);
        }    
		else res.json(404);
	});
};  