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
      category_list = proxy_db.collection('category')
      categories_collection.find({}).toArray((err, items) => {
        category_list = category_list.find({ active: true }).toArray((err, cat_items) => {
          // console.log({items})
          items = items.filter(i => cat_items.some(c_item => c_item.name == i.category))
          // console.log({ wow:items })
          console.log({cat_items})

          if (client_req.headers.host.includes(':')) {
            hostname = client_req.headers.host.split(':')[0]
            port = client_req.headers.host.split(':')[1]
          }
          if (hostname == 'localhost' && port == '8486') {
            handleLocalRequests(client_req, client_res)
            return
          }
          let is_filtered = items.some(item => (
            getDomain(hostname).startsWith(getDomain(item.name))
          ))
          if (!is_filtered) {
            // client_res.setHeader('Content-Type', 'application/json');
            client_res.setHeader('Access-Control-Allow-Origin', '*');
            client_res.setHeader('Access-Control-Request-Method', '*');
            client_res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
            client_res.setHeader('Access-Control-Allow-Headers', '*');
            client_res.end('<div style="width:100%;height:100%;border-radius:10px;text-align:center;color:white;font-size:50px;font-weight:bold;background: #2980B9;background: -webkit-linear-gradient(to top, #FFFFFF, #6DD5FA, #2980B9);background: linear-gradient(to top, #FFFFFF, #6DD5FA, #2980B9);padding:40px;">This Domain is Blocked</div>')
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
        })
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
        categories_collection.insertOne({ name: query['name'] , active: true}, (err, result) => {})
      }
    })
  }
  if(client_req.url.startsWith('/change-category-activation/')){
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
        console.log('ewre')
        categories_collection.updateOne({ name: query['name'] }, { $set: { active: query['active'] } })
        categories_collection.find({}).toArray((r, t) => {
          console.log({r})
        })
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
  if(client_req.url.startsWith('/remove-category/')){
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
        categories_collection.remove({ name: query['address'], category: query['category'] }, (err, result) => {})
      }
    })
  }
  if(client_req.url.startsWith('/remove-ips/')){
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
        categories_collection.remove({ name: query['address'], category: query['category'] }, (err, result) => {})
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