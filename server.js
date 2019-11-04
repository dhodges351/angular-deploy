require('dotenv');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const express = require('express');
const upload = require('./upload');
const deleteS3Images = require('./deleteS3Images');
const sanitizeHtml = require('sanitize-html');
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();
const mongodb = require("mongodb");
const ObjectID = mongodb.ObjectID;
var BLOGCONTENTS_COLLECTION = "blogcontents";
var COMMENTS_COLLECTION = "comments";
var BLOGPOSTS_COLLECTION = "blogposts";
var CONTACTS_COLLECTION = "contacts";
var GALLERY_COLLECTION = "gallery";
var db;

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors(corsOptions));
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

app.post('/api/upload', upload);
app.use('/api/upload', router);

app.post('/api/deleteS3Images', deleteS3Images);
app.use('/api/deleteS3Images', router);

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
  newBlogcontent.image = sanitizeHtml(newBlogcontent.image); 
  newBlogcontent.title = sanitizeHtml(newBlogcontent.title);
  newBlogcontent.category = sanitizeHtml(newBlogcontent.category);
  newBlogcontent.author = sanitizeHtml(newBlogcontent.author);
  newBlogcontent.content = sanitizeHtml(newBlogcontent.content);
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
  updateDoc.image = sanitizeHtml(updateDoc.image); 
  updateDoc.title = sanitizeHtml(updateDoc.title);
  updateDoc.category = sanitizeHtml(updateDoc.category);
  updateDoc.author = sanitizeHtml(updateDoc.author);
  updateDoc.content = sanitizeHtml(updateDoc.content);
  db.collection(BLOGCONTENTS_COLLECTION).updateOne(
    {"_id": new ObjectID(req.params.id)}, 
    { $set: {
      "currentBlog":updateDoc.currentBlog,
      "image":updateDoc.image, 
      "title":updateDoc.title, 
      "category":updateDoc.category, 
      "content":updateDoc.content,
      "likes": updateDoc.likes,
      "dislikes": updateDoc.dislikes,
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
  newComment.author = sanitizeHtml(newComment.author); 
  newComment.comment = sanitizeHtml(newComment.comment);  
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
  updateDoc.author = sanitizeHtml(updateDoc.author); 
  updateDoc.comment = sanitizeHtml(updateDoc.comment);  
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
  newBlogpost.image = sanitizeHtml(newBlogpost.image); 
  newBlogpost.title = sanitizeHtml(newBlogpost.title);
  newBlogpost.category = sanitizeHtml(newBlogpost.category);
  newBlogpost.author = sanitizeHtml(newBlogpost.author);
  newBlogpost.short_desc = sanitizeHtml(newBlogpost.short_desc);  
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
  //updateDoc.image = sanitizeHtml(updateDoc.image); 
  updateDoc.title = sanitizeHtml(updateDoc.title);
  updateDoc.category = sanitizeHtml(updateDoc.category);
  updateDoc.author = sanitizeHtml(updateDoc.author);
  updateDoc.short_desc = sanitizeHtml(updateDoc.short_desc); 
  db.collection(BLOGPOSTS_COLLECTION).updateOne(
    {"_id": new ObjectID(req.params.id)}, 
    { $set: {
      "title":updateDoc.title,
      "category":updateDoc.category, 
      "short_desc":updateDoc.short_desc,
      "author":updateDoc.author,
      "image":updateDoc.image,
      "likes": updateDoc.likes,
      "dislikes": updateDoc.dislikes,
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
  newContact.firstname = sanitizeHtml(newContact.firstname);
  newContact.lastname = sanitizeHtml(newContact.lastname);
  newContact.email = sanitizeHtml(newContact.email);
  newContact.subject = sanitizeHtml(newContact.subject);
  newContact.message = sanitizeHtml(newContact.message);
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
  updateDoc.firstname = sanitizeHtml(updateDoc.firstname);
  updateDoc.lastname = sanitizeHtml(updateDoc.lastname);
  updateDoc.email = sanitizeHtml(updateDoc.email);
  updateDoc.subject = sanitizeHtml(updateDoc.subject);
  updateDoc.message = sanitizeHtml(updateDoc.message);
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
  newGalleryItem.title = sanitizeHtml(newGalleryItem.title);
  newGalleryItem.title = sanitizeHtml(newGalleryItem.title);
  newGalleryItem.details = sanitizeHtml(newGalleryItem.details);
  newGalleryItem.author = sanitizeHtml(newGalleryItem.author);
  newGalleryItem.image = sanitizeHtml(newGalleryItem.image);
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
  updateDoc.title = sanitizeHtml(updateDoc.title);
  updateDoc.title = sanitizeHtml(updateDoc.title);
  updateDoc.details = sanitizeHtml(updateDoc.details);
  updateDoc.author = sanitizeHtml(updateDoc.author);
  updateDoc.image = sanitizeHtml(updateDoc.image);
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

