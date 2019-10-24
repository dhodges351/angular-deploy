require('dotenv');
require('dotenv').config();
const cors = require('cors');
const logger = require('morgan');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path'); 
const express = require('express');
const multer = require('multer');
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();
var DIR = '';
if ( app.get('env') === 'development' ) {
  DIR = './src/assets/images';
}
else
{
  DIR = './dist/assets/images';
}
const mongodb = require("mongodb");
const ObjectID = mongodb.ObjectID;
var BLOGCONTENTS_COLLECTION = "blogcontents";
var COMMENTS_COLLECTION = "comments";
var BLOGPOSTS_COLLECTION = "blogposts";
var CONTACTS_COLLECTION = "contacts";
var GALLERY_COLLECTION = "gallery";
var db;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(logger('dev')); 
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 

mongodb.MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blogDb', function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");  

  // Initialize the app.
  var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);    
  });  
});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    //cb(null, file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname));
    cb(null, file.originalname);
  }
});
let upload = multer({storage: storage});
app.get('/api', function (req, res) {
  res.end('file catcher example');
}); 
app.post('/api/upload',upload.single('photo'), function (req, res) {
  if (!req.file) {
      console.log("No file received");
      return res.send({
        success: false
      });
  
    } else {
      console.log('file received');
      return res.send({
        success: true
      })
    }
});
app.use('/api/upload', router);

app.get("/api/config", function(req, res) {
  try {
    var doc = '';
    doc += process.env.AWS_ACCESS_KEY_ID + ",";
    doc += process.env.AWS_SECRET_ACCESS_KEY +",";
    doc += process.env.S3_BUCKET_NAME;
    res.status(200).json(doc);
  } catch (err) {
    handleError(res, err.message, "Failed to get response.");
  }
});


/********************************************
  blogcontents collection
*********************************************/
app.get("/api/blogcontents", function(req, res) {
  db.collection(BLOGCONTENTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get blog contents.");
    } else {
      res.status(200).json(docs);
    }
  });
});
app.get("/api/blogcontents/:id", function(req, res) {
  db.collection(BLOGCONTENTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get blog content");
    } else {
      res.status(200).json(doc);
    }
  });
});
app.post("/api/blogcontents", function(req, res) {
  var newBlogcontent= req.body;
  newBlogcontent.createdAt = new Date();
  newBlogcontent.updatedAt = new Date();  
  if (!req.body.title) {
    handleError(res, "Invalid user input", "Must provide a title.", 400);
  } else {
    db.collection(BLOGCONTENTS_COLLECTION).insertOne(
      newBlogcontent, 
      function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new blog content.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});
app.put("/api/blogcontents/:id", function(req, res) {
  var updateDoc = req.body;  
  db.collection(BLOGCONTENTS_COLLECTION).updateOne(
    {"_id": new ObjectID(req.params.id)}, 
    { $set: {
      "currentBlog":updateDoc.currentBlog,
      "image":updateDoc.image, 
      "title":updateDoc.title, 
      "category":updateDoc.category, 
      "content":updateDoc.content,
      "updatedAt": new Date()
    } },    
    function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to update comment");
      } else {
        updateDoc._id = req.params.id;
        res.status(200).json(updateDoc);
      }
  }); 
});
app.delete("/api/blogcontents/:id", function(req, res) {
  db.collection(BLOGCONTENTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete blog content");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

/********************************************
  comments collection
*********************************************/
app.get("/api/comments", function(req, res) {
  db.collection(COMMENTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get comments");
    } else {
      res.status(200).json(docs);
    }
  });
});
app.get("/api/comments/:id", function(req, res) {
  db.collection(COMMENTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get comment");
    } else {
      res.status(200).json(doc);
    }
  });
});
app.post("/api/comments", function(req, res) {
  var newComment= req.body;  
  newComment.createdAt = new Date();
  newComment.updatedAt = new Date();
  if (!req.body.author) {
    handleError(res, "Invalid user input", "Must provide an author.", 400);
  } else {
    db.collection(COMMENTS_COLLECTION).insertOne(newComment, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new comment.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});
app.put("/api/comments/:id", function(req, res) {
  var updateDoc = req.body;
  db.collection(COMMENTS_COLLECTION).updateOne(
    {"_id": new ObjectID(req.params.id)}, 
    { $set: {
      "blogPostId":updateDoc.blogPostId,
      "author":updateDoc.author, 
      "comment":updateDoc.comment,
      "updatedAt": new Date()
    } },
    function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update comment");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});
app.delete("/api/comments/:id", function(req, res) {
  db.collection(COMMENTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete comment");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

/********************************************
  blogposts collection
*********************************************/
app.get("/api/blogposts", function(req, res) {
  db.collection(BLOGPOSTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get blog posts.");
    } else {
      res.status(200).json(docs);
    }
  });
});
app.get("/api/blogposts/:id", function(req, res) {
  db.collection(BLOGPOSTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get blog post");
    } else {
      res.status(200).json(doc);
    }
  });
});
app.post("/api/blogposts", function(req, res) {
  var newBlogpost= req.body;
  newBlogpost.createdAt = new Date();
  newBlogpost.updatedAt = new Date();
  if (!req.body.author) {
    handleError(res, "Invalid user input", "Must provide an author.", 400);
  } else {
    db.collection(BLOGPOSTS_COLLECTION).insertOne(newBlogpost, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new blog post.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});
app.put("/api/blogposts/:id", function(req, res) {
  var updateDoc = req.body;
  db.collection(BLOGPOSTS_COLLECTION).updateOne(
    {"_id": new ObjectID(req.params.id)}, 
    { $set: {
      "title":updateDoc.title,
      "category":updateDoc.category, 
      "short_desc":updateDoc.short_desc,
      "author":updateDoc.author,
      "image":updateDoc.image,
      "updatedAt": new Date()
    } },  
    function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update blog post");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});
app.delete("/api/blogposts/:id", function(req, res) {
  db.collection(BLOGPOSTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete blog post");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

/********************************************
  contacts collection
*********************************************/
app.get("/api/contacts", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});
app.get("/api/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);
    }
  });
});
app.post("/api/contacts", function(req, res) {
  var newContact = req.body;
  newContact.createdAt = new Date();
  newContact.updatedAt = new Date();
  if (!req.body.firstname) {
    handleError(res, "Invalid user input", "Must provide a name.", 400);
  } else {
    db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new contact.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});
app.put("/api/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  db.collection(BLOGPOSTS_COLLECTION).updateOne(
    {"_id": new ObjectID(req.params.id)}, 
    { $set: {
      "firstname":updateDoc.firstname,
      "lastname":updateDoc.lastname, 
      "email":updateDoc.email,
      "subject":updateDoc.subject,
      "message":updateDoc.message,
      "updatedAt": new Date()
    } },  
    function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update cpmtact");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});
app.delete("/api/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

/********************************************
  gallery collection
*********************************************/
app.get("/api/gallery", function(req, res) {
  db.collection(GALLERY_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get gallery items");
    } else {
      res.status(200).json(docs);
    }
  });
});
app.get("/api/gallery/:id", function(req, res) {
  db.collection(GALLERY_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get gallery item");
    } else {
      res.status(200).json(doc);
    }
  });
});
app.post("/api/gallery", function(req, res) {
  var newGalleryItem= req.body;  
  newGalleryItem.createdAt = new Date();
  newGalleryItem.updatedAt = new Date();
  if (!req.body.author) {
    handleError(res, "Invalid user input", "Must provide an author.", 400);
  } else {
    db.collection(GALLERY_COLLECTION).insertOne(newGalleryItem, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new gallery item.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});
app.put("/api/gallery/:id", function(req, res) {
  var updateDoc = req.body;
  db.collection(GALLERY_COLLECTION).updateOne(
    {"_id": new ObjectID(req.params.id)}, 
    { $set: {      
      "title":updateDoc.title,
      "category":updateDoc.category, 
      "author":updateDoc.author, 
      "image":updateDoc.image,
      "details":updateDoc.details,
      "updatedAt": new Date()
    } },
    function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update gallery item");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});
app.delete("/api/gallery/:id", function(req, res) {
  db.collection(GALLERY_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete gallery item");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

module.exports = app;

