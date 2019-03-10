var http = require('http');

http.createServer(onRequest).listen(8486);

function onRequest(client_req, client_res) {
  let hostname = client_req.headers.host
  let port = 80
  if(client_req.headers.host.includes(':')){
    hostname = client_req.headers.host.split(':')[0]
    port = client_req.headers.host.split(':')[1]
  }
  if(hostname == 'localhost' && port == '8486'){
    client_res.setHeader('Content-Type', 'application/json');
    client_res.end(JSON.stringify({ a: 1 }))
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

// 192.168.2.201
// 8123