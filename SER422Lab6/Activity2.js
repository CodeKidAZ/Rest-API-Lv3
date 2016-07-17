var restify = require("restify");
var mongo = require('./functions.js');

var server = restify.createServer({
    name:"my rest server"
});
server.use(restify.bodyParser());
server.use(restify.queryParser());

server.listen(8081, function(){
    console.log("Server on 8081..");
});


//____________________________________________________________ POST
server.post('/v1/Authors', function(req, res){

    var collectionName = "Authors";

    var valueObj = {
        id: parseInt(req.body.id),
        firstname : req.body.firstname,
        lastname : req.body.lastname
    }

    if(valueObj.id){
        mongo.createDoc(collectionName, valueObj, req, res)
    }
    else{
        res.status(400);
        mongo.badRequest(collectionName,"#","id not defined in body",res,"Books","#");

    }


});
server.post('/v1/Books', function(req, res){

    var collectionName = "Books";

    var bookObj = { };
    //var authorsObj = { };
    if(req.body.isbn){
        bookObj.isbn = parseInt(req.body.isbn);
    }
    if(req.body.publisher){
        bookObj.publisher = req.body.publisher;
    }
    if(req.body.title){
        bookObj.title = req.body.title;
    }
    if(req.body.year){
        bookObj.year = req.body.year;
    }
   // console.log(req.url ,req.body.author);
    if(req.body.authors){
        bookObj.authors = req.body.authors;

        console.log(req.body.authors);
        var authorsArray = req.body.authors;
        console.log(Array.isArray(authorsArray));

        console.log(JSON.stringify(authorsArray));
        //add authors to mongo
        mongo.createDoc("Authors",authorsArray,req,res);

        //add books to mongo
        mongo.createDoc(collectionName,bookObj, req, res)
       // console.log("BooksOBJ is "+JSON.stringify(bookObj));


    }
    else{
        res.json({"message":"No Authors, so Books will not be added"});
    }


});
//____________________________________________________________________ PUT AUTHOR
server.put('/v1/Authors/:id', function(req, res){

    var collectionName = "Authors";

    var setObj = {};
    var id;
    if(req.params.id){
        id = req.params.id
    }
    if(req.body.firstname){
        setObj.firstname = req.body.firstname
    }
    if (req.body.lastname){
        setObj.lastname = req.body.lastname
    }

    console.log(JSON.stringify(setObj));
    if(id){
        mongo.updateDoc(collectionName,id,setObj,req,res);
    }
    else{
        res.status(400);
        mongo.badRequest(collectionName,"#","/id not defined url",res,"Books","#");
    }



});
server.put('/v1/Books/:isbn', function(req, res){

    var collectionName = "Books";

    var setObj = {};
    var isbn;
    if(req.params.isbn){
        isbn = parseInt(req.params.isbn);
    }
    if(req.body.publisher){
        setObj.publisher = req.body.publisher
    }
    if (req.body.title){
        setObj.title = req.body.title
    }
    if (req.body.year){
        setObj.year = req.body.year
    }

    if(isbn){
        mongo.updateDoc(collectionName,isbn,setObj,req,res)
    }
    else{
        res.status(400);
        mongo.badRequest(collectionName,"#","isbn not defined in url",res,"Authors","#");
    }


});

//_______________________________________________________________________GET
server.get('/v1/Authors/:id', function(req, res){  //id
    //http://localhost:8081/v1/Authors/1

    var collectionName = "Authors";
    var id = req.params.id;

    if(id){
        mongo.getDoc(collectionName,id,req,res);
    }
    else{
        res.status(400);
        mongo.badRequest(collectionName,"#","id not defined in url",res,"Authors","#");

    }


});
server.get('/v1/Books/:isbn', function(req, res){  //isbn
    //http://localhost:8081/v1/Books/1

    var collectionName = "Books";
    var isbn = parseInt(req.params.isbn);

    if(isbn){
        mongo.getDoc(collectionName,isbn, req, res);
    }
    else{
        res.status(400);
        mongo.badRequest(collectionName,"#","isbn not defined in url",res,"Authors","#");
    }

});
server.get('/v1/bookCollection/:title', function(req, res){  //isbn

    var title= req.params.title;
   // mongo.getDoc(title);


});

//_____________________________________________________________________DEL
server.del('/v1/Authors/:id', function(req, res){  //1 param

    var collectionName = "Authors";
    var id = parseInt(req.params.id);

    if(id){
        mongo.delDoc(collectionName,id, req, res);
    }
    else{
        res.status(400);
        mongo.badRequest(collectionName,"#","id not defined in url",res,"Authors","#");
    }

});
//_________________________________________________________________DEL
server.del('/v1/Books/:isbn', function(req, res){  //1 param

    var collectionName = "Books";
    var isbn = parseInt(req.params.isbn);

    if(isbn){
        mongo.delDoc(collectionName,isbn, req, res);
    }
    else{
        res.status(400);
        mongo.badRequest(collectionName,"#","isbn not defined in url",res,"Authors","#");
    }
});
