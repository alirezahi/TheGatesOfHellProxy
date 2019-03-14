var http = require('http');
var url = require('url');
const mongo = require('mongodb').MongoClient

/*******  connecting mongodb *******/
const url_mongo = 'mongodb://localhost:27017'


http.createServer(onRequest).listen(8486);

function onRequest(client_req, client_res) {
  let hostname = client_req.headers.host
  let port = 80
  mongo.connect(url_mongo, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      console.error(err)
      return
    }
    else{
      let proxy_db = client.db('proxy')
      categories_collection = proxy_db.collection('ips')
      categories_collection.find({}).toArray((err, items) => {
        let is_filtered = items.some(item => (
          getDomain(hostname).startsWith(getDomain(item.name))
        ))
        if(is_filtered){
          client_res.setHeader('Content-Type', 'application/json');
          client_res.setHeader('Access-Control-Allow-Origin', '*');
          client_res.setHeader('Access-Control-Request-Method', '*');
          client_res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
          client_res.setHeader('Access-Control-Allow-Headers', '*');
          client_res.end(JSON.stringify({
            response: "It's filtered"
          }))
          return
        }else{
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
            client_res.writeHead(res.statusCode, trimObj(res.headers))
            res.pipe(client_res, {
              end: true
            });
          });
          client_req.pipe(proxy, {
            end: true
          });
        }
      })
    }
  })
  
}


// handle local requests
function handleLocalRequests(client_req, client_res){
  if(client_req.url.startsWith('/items-list/')){
    mongo.connect(url_mongo, { useNewUrlParser: true }, (err, client) => {
      if (err) {
        console.error(err)
        return
      }
      else{
        let proxy_db = client.db('proxy')
        categories_collection = proxy_db.collection('category')
        categories_collection.find({}).toArray((err, items) => {
          ips_list = proxy_db.collection('ips')
          ips_list.find({}).toArray((ips_err, ips_items) => {
            client_res.setHeader('Content-Type', 'application/json');
            client_res.setHeader('Access-Control-Allow-Origin', '*');
            client_res.setHeader('Access-Control-Request-Method', '*');
            client_res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
            client_res.setHeader('Access-Control-Allow-Headers', '*');
            client_res.end(JSON.stringify({
              categories: items,
              ips_list: ips_items,
            }))
            return
          })
        })
      }
    })
  }
  if(client_req.url.startsWith('/add-category/')){
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
        categories_collection.insertOne({ name: query['name'] }, (err, result) => {})
      }
    })
  }
  if(client_req.url.startsWith('/add-ips/')){
    var url_parts = url.parse(client_req.url, true);
    var query = url_parts.query;
    mongo.connect(url_mongo, { useNewUrlParser: true }, (err, client) => {
      if (err) {
        console.error(err)
        return
      }
      else{
        let proxy_db = client.db('proxy')
        categories_collection = proxy_db.collection('ips')
        categories_collection.insertOne({ name: query['address'], category: query['category'] }, (err, result) => {})
      }
    })
  }
}

function trimObj(obj) {
  if (!Array.isArray(obj) && typeof obj != 'object') return obj;
  return Object.keys(obj).reduce(function(acc, key) {
    acc[key.trim()] = typeof obj[key] == 'string'? obj[key] : trimObj(obj[key]);
    return acc;
  }, Array.isArray(obj)? []:{});
}


function getDomain(url) {
  var prefix = /^https?:\/\//i;
  var domain = /^[^\/:]+/;
  // remove any prefix
  url = url.replace(prefix, "");
  // assume any URL that starts with a / is on the current page's domain
  if (url.charAt(0) === "/") {
      url = window.location.hostname + url;
  }
  // now extract just the domain
  var match = url.match(domain);
  if (match) {
      return(match[0]);
  }
  return(null);
}

// 192.168.2.201
// 8123