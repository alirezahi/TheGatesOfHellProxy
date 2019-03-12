var http = require('http');
var url = require('url');
const mongo = require('mongodb').MongoClient

/*******  connecting mongodb *******/
const url_mongo = 'mongodb://localhost:27017'


http.createServer(onRequest).listen(8486);

function onRequest(client_req, client_res) {
  // console.log(client_req)
  let hostname = client_req.headers.host
  let port = 80
  if(client_req.headers.host.includes(':')){
    hostname = client_req.headers.host.split(':')[0]
    port = client_req.headers.host.split(':')[1]
  }
  if(hostname == 'localhost' && port == '8486'){
    handleLocalRequests(client_req, client_res)
    return
  }
  var options = {
    hostname: hostname,
    port: port,
    path: client_req.url,
    method: client_req.method,
    headers: client_req.headers
  };

  var proxy = http.request(options, function (res) {
    client_res.writeHead(res.statusCode, res.headers)
    res.pipe(client_res, {
      end: true
    });
  });
  client_req.pipe(proxy, {
    end: true
  });
}


// handle local requests
function handleLocalRequests(client_req, client_res){
  if(client_req.url.startsWith('/category-list/')){
    mongo.connect(url_mongo, { useNewUrlParser: true }, (err, client) => {
      if (err) {
        console.error(err)
        return
      }
      else{
        let proxy_db = client.db('proxy')
        categories_collection = proxy_db.collection('category')
        categories_collection.find({}).toArray((err, items) => {
          client_res.setHeader('Content-Type', 'application/json');
          client_res.setHeader('Access-Control-Allow-Origin', '*');
          client_res.setHeader('Access-Control-Request-Method', '*');
          client_res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
          client_res.setHeader('Access-Control-Allow-Headers', '*');
          client_res.end(JSON.stringify(items))
          return
        })
        // categories_collection.insertOne({ name: query['name'] }, (err, result) => {

        // })
      }
    })
  }
  if(client_req.url.startsWith('/category/')){
    var url_parts = url.parse(client_req.url, true);
    var query = url_parts.query;
    mongo.connect(url_mongo, { useNewUrlParser: true }, (err, client) => {
      if (err) {
        console.error(err)
        return
      }
      else{
        let proxy_db = client.db('proxy')
        categories_collection = proxy_db.collection('category')
        categories_collection.find({}).toArray((err, items) => {
          console.log(items)
        })
        categories_collection.insertOne({ name: query['name'] }, (err, result) => {

        })
      }
    })
  }
}

// 192.168.2.201
// 8123