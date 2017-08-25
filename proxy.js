var config = require('config');
var cluster = require('cluster');

if(cluster.isMaster) {
  /**
   * A varibale contains number of available CPU cores. Value stored in config.
   * @var {number} numCPUs
   */
  // var numCPUs = require('os').cpus().length;
  var numCPUs = config.get('CPU.cores');

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  cluster.on('exit', (worker, code, signal) => {
    if(signal) {
      console.log(`Worker ${worker.process.pid} was killed by signal: ${signal}`);
    } else if (code !== 0) {
      console.log(`Worker ${worker.process.pid} exited with error code: ${code}`);
    } else {
      console.log(`Worker ${worker.process.id} successfully exited.`);
    }
    var time = config.get('CPU.timeout');
    setTimeout(cluster.fork(), time);
  });

} else {
  var RequestHelper = require('./request-helper');
  var http = require('http');

  /**
   * Instance of RequestHelper class
   * @var {RequestHelper} requestHelper
   */
  var requestHelper = new RequestHelper();
  var server = http.createServer();

  /**
   * Emitted each time there is a request from client browser to our proxy server.
   * @listens http.Server#request
   * @param {http.IncomingMessage} request
   * @param {http.ServerResponse} response
   * @see Read in the {@link https://nodejs.org/en/docs/ |NodeJS docs} about class http.Server and his events
   */
  server.on('request', function(request, response) {

    if (!requestHelper.isHostAllowed(request.url)) {
      var forbidden = requestHelper.forbidden();
      response.writeHead(forbidden['status-code'], forbidden['headers']);
      response.end(forbidden['html-answer'], forbidden['encoding']);
      return;
    }

    /**
     * A variable for accumulating data from server's answer
     * @var {string} data
     */
    var data = '';
    /**
     * A variable that contains right options for sending request
     * @var {object} options
     */
    var options = requestHelper.requestOptions(request);

    console.log(`Request hostname: ${request.url}\nWorker ${process.pid}`);

    /**
     * Send request to the requested by user host.
     * @param {object} options this parameter getting by calling RequestHelper#requestOptions
     * @param {function(result)} - an anonymous function that gets response of the requested server.
     result is an instance of http.IncomingMessage class.
     * @return {http.clientRequest} result of calling this method will saved in requestClient variable
     * @see Read in the {@link https://nodejs.org/en/docs/ |NodeJS docs} about http.request method
     */
    var requestClient = http.request(options, (result) => {

      /**
       * A variable that contains values of right encodings for incoming and outgoing data.
       * @var {array} encoding
       */
      var encoding = requestHelper.contentEncoding(result.rawHeaders);
      result.setEncoding(encoding['incoming']);

      /**
       * Gets incoming data from requested server by chanks (parts) and accumulates it for
       * sending back to the client's browser.
       * @listens http.IncomingMessage#data
       * @param {string} chunk part of the answer from requested host
       */
      result.on('data', (chunk) => {
        data += chunk;
      });

      /**
       * Emitted when finish sending the request. Sends back data from requested host to the client browser.
       * @listens http.clientRequest#end
       */
      result.on('end', () => {
        console.log(`End of request/response with ${request.url}.\nWorker ${process.pid}`);
        response.writeHead(result.statusCode, result.headers);
        response.end(data, encoding['incoming']);
      });
    });

    requestClient.on('error', (error) => {
      console.log(error);
    });

    /**
     * @emits http.clientRequest#end
     */
    requestClient.end();
  });

  /**
   * A variable contains value of the listened port. Value stored in config file.
   * @var {number} port
   */
  var port = config.get('Proxy.port');
  server.listen(port);
  console.log(`Listen 127.0.0.1:${port}.\nWorker ${process.pid}`);
}
