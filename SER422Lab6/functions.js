var mongodb = require('mongodb');
//________________________________________________________________CREATE DOC
function createDoc(collectionName, valueObj, req, res) {
    console.log(" ");
    console.log("POST "+ console.log(req.url));
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/lab6'; //connection string
    var clientDoc2 ={};

    //This object used to check if data is already present. if not then insert()
    if (collectionName == "Authors") {
        clientDoc2 =
        {
            "id": parseInt(valueObj.id)
        }
    }
    else if (collectionName == "Books") {
        clientDoc2 =
        {
            "isbn": parseInt(valueObj.isbn)
        }
    }
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log("Unable to connect to mongo server", err);
            mongoError(err,res);
        }
        else {
            console.log("Connection established");

            var collection = db.collection(collectionName);
                collection.find(clientDoc2, {_id: 0}).toArray(function (err, doc) {
                    if (err) {
                        mongoError(err,res);
                    }
                    else if (doc.length) {
                        //console.log(collectionName + " ALREADY PRESENT")
                        res.status(400);
                        res.header('Content-Type', "application/json");
                        //res.json({"message": "Same "+collectionName+" already present"});
                        createSucessResponse("Authors","#",collectionName + " with same data found, so no change made",res,"Books","#");
                    }
                    else {
                        //console.log(collectionName + " CREATED");
                        collection.insert(valueObj, function (err, result) {
                            //var d = result;
                            //console.log(d["ops"]);
                            if (err) {
                                console.log(err);

                                res.status(500);
                                res.header('Content-Type', "application/json");
                                res.json(err);
                            }
                            else {
                                res.status(201);
                                res.header('Content-Type', "application/json");

                                if(collectionName == "Authors") {
                                    res.header("Location","http://localhost:8081/v1/"+collectionName+"/" + clientDoc2.id);
                                    createSucessResponse(collectionName,clientDoc2.id,result["ops"],res,"Books","#");
                                }
                                else if(collectionName == "Books"){
                                    res.header("Location","http://localhost:8081/v1/"+collectionName+"/" + clientDoc2.isbn);
                                    createSucessResponse(collectionName,clientDoc2.isbn,result["ops"],res,"Authors","#");
                                }
                            }
                            db.close();//close connection
                        })

                    }
                })
            }
        })
    return 1;
    }

//________________________________________________________________________ GET
function getDoc(collectionName, value, req, res) {
    console.log(" ");
    console.log("GET "+ console.log(req.url));
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/lab6'; //connection string
    var clientDoc2 = {};

    if (collectionName == "Authors") {
        clientDoc2 =
        {
            "id": parseInt(value)
        }
    }
    else if (collectionName == "Books") {
        clientDoc2 =
        {
            "isbn": parseInt(value)
        }
    }

    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log("Unable to connect to mongo server", err);
            mongoError(err,res);
        } else {
            console.log("Connection established");

            var collection = db.collection(collectionName);
            collection.find(clientDoc2, {_id: 0}).toArray(function (err, result) {

                if (err) {
                    doc;
                    mongoError(err,res);
                }
                else if (result.length) {
                    //console.log("Result is: ", result); //doc is JSON object created from BSON data it got from mongodb
                    /*result.forEach(function (result) {//loop the array of objects/documents
                        console.log(JSON.stringify(result));
                    });*/
                    res.status(200);
                    res.header('Content-Type', "application/json");
                    if(collectionName == "Authors") {
                        createSucessResponse(collectionName,clientDoc2.id,result,res,"Books","#");
                    }
                    else if(collectionName == "Books"){
                        createSucessResponse(collectionName,clientDoc2.isbn,result,res,"Authors","#");
                    }
                }
                else {
                    res.status(204);
                    res.header('Content-Type', "application/json");
                    res.json({"message": "Your content not found"});
                }

                db.close();//close connection
            })
        }
    });

}

//____________________________________________________________________UPDATE
function updateDoc(collectionName,id, setObj, req, res) {
    console.log(" ");
    console.log("PUT "+ console.log(req.url));
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/lab6'; //connection string

    var query = {};

    if(collectionName =="Authors"){
        query.id =  parseInt(id);
    }
    else if(collectionName == "Books"){
        query.isbn = parseInt(id);
    }
    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log("Unable to connect to mongo server", err);
            mongoError(err,res);
        }
        else {
            console.log("Connection established " + collectionName);
            var collection = db.collection(collectionName);
            console.log("QUERY "+JSON.stringify(query));
            console.log("SET "+JSON.stringify(setObj));
            collection.update(query, {$set: setObj}, function (err, result) {
                var d = JSON.parse(result);
                console.log(d);
                if (err) {
                    mongoError(err,res);
                }
                else if (d.nModified == 1) {
                    res.status(200);
                    res.header('Content-Type', "application/json");
                    if(collectionName == "Authors") {
                        console.log(JSON.stringify(result));
                        setObj.id = query.id;
                        createSucessResponse(collectionName,query.id,setObj,res,"Books","#");

                    }
                    else if(collectionName == "Books"){
                        console.log(JSON.stringify(result));
                        setObj.isbn = query.isbn;
                        createSucessResponse(collectionName,query.isbn,setObj,res,"Authors","#");

                    }

                }
                else if(d.n == 1){
                    res.status(400);
                    res.header('Content-Type', "application/json");
                    if(collectionName == "Authors") {
                        console.log(JSON.stringify(result));
                        createSucessResponse(collectionName,query.id,collectionName + " with same data found, so no change made",res,"Books","#");

                    }
                    else if(collectionName == "Books"){
                        createSucessResponse(collectionName,query.isbn,collectionName + " with same data found, so no change made",res,"Authors","#");
                    }

                }
                else {
                    res.status(404);
                    res.header('Content-Type', "application/json");
                    if(collectionName == "Authors") {
                        createSucessResponse(collectionName,"#","id not found in database",res,"Books","#")

                    }
                    else if(collectionName == "Books"){
                        createSucessResponse(collectionName,"#","isbn not found in database",res,"Authors","#")
                    }
                }

                db.close();//close connection

            })
        }
    });
}
//____________________________________________________________________ DELETE
function delDoc(collectionName, value, req, res) {
    console.log(" ");
    console.log("DEL "+ console.log(req.url));
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/lab6'; //connection string
    var clientDoc2 = {};

    if (collectionName == "Authors") {
        clientDoc2 =
        {
            "id": parseInt(value)
        }
    }
    else if (collectionName == "Books") {
        clientDoc2 =
        {
            "isbn": parseInt(value)
        }
    }

    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log("Unable to connect to mongo server", err);
            mongoError(err,res);
        } else {
            console.log("Connection established");
            var collection = db.collection(collectionName);

            collection.find(clientDoc2, {_id: 0}).toArray(function (err, doc) {
                if (err) {
                    mongoError(err,res);
                }
                else if (doc.length) {
                    collection.remove(clientDoc2);
                    res.status(200);
                    res.header('Content-Type', "application/json");
                    if(collectionName == "Authors") {
                        createSucessResponse(collectionName,"#","Delete Success",res,"Books","#");

                    }
                    else if(collectionName == "Books"){
                        createSucessResponse(collectionName,"#","Delete Success",res,"Authors","#");
                    }
                }
                else {
                    res.status(404);
                    res.header('Content-Type', "application/json");
                    if(collectionName == "Authors") {
                        createSucessResponse(collectionName,"#","id not found in database",res,"Books","#")

                    }
                    else if(collectionName == "Books"){
                        createSucessResponse(collectionName,"#","isbn not found in database",res,"Authors","#")
                    }
                }

                db.close();//close connection
            })
        }
    });
}
//_______________________________________________________ FIND
function findDoc(collectionName, authorObject, req, res) {
    console.log(" ");
    console.log("FIND ");
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/lab6'; //connection string
    var query = {};
    //console.log(JSON.stringify(authorObject.id));
    if (collectionName == "Authors") {
        query =
        {
            "id": authorObject.id
        }
    }
    //console.log(JSON.stringify(query));

    var abc = {};

    MongoClient.connect(url, function (err, db) {
        if (err) {
            console.log("Unable to connect to mongo server", err);
            mongoError(err,res);
        } else {
            console.log("Connection established");
            var collection = db.collection(collectionName);

            collection.find(query, {_id: 0}).toArray(function (err, doc) {                console.log(doc);
                if (err) {
                    mongoError(err,res);
                }
                else if (doc.length) {
                    //console.log("DOC IS ARRAY "+Array.isArray(doc));
                    doc.forEach(function(doc){
                        //console.log("DOC FOUND "+doc.id+ " "+doc.firstname);
                    })
                    abc = doc;
                    //res.status(200);
                    //res.header('Content-Type', "application/json");
                    /*if(collectionName == "Authors") {
                        createSucessResponse(collectionName,"#","Delete Success",res,"Books","#");

                    }
                    else if(collectionName == "Books"){
                        createSucessResponse(collectionName,"#","Delete Success",res,"Authors","#");
                    }*/
                }
                else {
                    //res.status(404);
                    //res.header('Content-Type', "application/json");
                    /*if(collectionName == "Authors") {
                        createSucessResponse(collectionName,"#","id not found in database",res,"Books","#")

                    }
                    else if(collectionName == "Books"){
                        createSucessResponse(collectionName,"#","isbn not found in database",res,"Authors","#")
                    }*/
                }

                db.close();//close connection
                console.log("db close")
            })
        }
    });

}
function mongoError(err,res) {
    console.log(err);
    res.status(500);
    res.header('Content-Type', "application/json");
    res.json(err);
}
//_____________________________________________________________________________________________RESPONSE WITH HYPERMEDIA
function createSucessResponse(collectionName, index, result, res, collectionName2,index2){
    res.json({
        "Result":result,
         [collectionName+" Services"]: [{
            "links": [
                {
                    "rel": "Create new "+collectionName,
                    "href": "http://localhost:8081/v1/"+collectionName,
                    "method":"Post",
                    "body": "Required"
                },
                {
                    "rel": "Get details of "+collectionName+" "+index,
                    "href": "http://localhost:8081/v1/"+collectionName+"/" + index,
                    "method":"Get",
                    "body": "Not required"
                },
                {
                    "rel": "Update "+collectionName+" "+index,
                    "href": "http://localhost:8081/v1/"+collectionName+"/" + index,
                    "method":"Put",
                    "body": "Required"
                },
                {
                    "rel": "Delete "+collectionName+" "+index,
                    "href": "http://localhost:8081/v1/"+collectionName+"/" + index,
                    "method":"Delete",
                    "body": "Not required"
                },
            ],

        }],
        [collectionName2+" Services"]: [{
            "links": [
                {
                    "rel": "Create new "+collectionName2,
                    "href": "http://localhost:8081/v1/"+collectionName2,
                    "method": "Post",
                    "body": "Required"
                },
                {
                    "rel": "Get details of "+collectionName2+" "+index2,
                    "href": "http://localhost:8081/v1/"+collectionName2+"/" + index2,
                    "method":"Get",
                    "body": "Not required"
                },
                {
                    "rel": "Update "+collectionName2+" "+index2,
                    "href": "http://localhost:8081/v1/"+collectionName2+"/" + index2,
                    "method":"Put",
                    "body": "Required"
                },
                {
                    "rel": "Delete "+collectionName2+" "+index2,
                    "href": "http://localhost:8081/v1/"+collectionName2+"/" + index2,
                    "method":"Delete",
                    "body": "Not required"
                },
            ],

        }]

    })

}
module.exports.getDoc = getDoc;
module.exports.delDoc = delDoc;
module.exports.createDoc = createDoc;
module.exports.updateDoc = updateDoc;
module.exports.badRequest = createSucessResponse;
module.exports.findDoc = findDoc;
