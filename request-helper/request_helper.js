/**
 * Creates an instance of RequestHelper.
 *
 * @constructor
 * @this {RequestHelper}
 */
function RequestHelper() {
  this.supportEncodings = [
    'utf8', 'utf-8', 'ucs2', 'ucs-2',
    'utf16le', 'utf-16le', 'latin1', 'binary',
    'base64', 'ascii', 'hex'
  ];
  this.denyHosts = [
    'gipnomag.ru', 'mychell.ru', 'manystars.ru',
    'opentests.ru', 'amur-bereg.ru'
  ];
  this.url = require('url');
};

/**
 * Check user acces to the requested host.
 * @function
 * @name isHostAllowed
 * @this {RequestHelper}
 * @param {string} url
 * @return {boolean}
 */
function isHostAllowed(url) {
  var requestUrl = this.url.parse(url, true);

  var hostname = requestUrl.hostname.toString();
  if (this.denyHosts.indexOf(hostname) != -1) {
    return false;
  }

  return true;
};

/**
 * Get right options for the request. <p><b>Note:</b> the requested server will send data without compression.</p>
 * @function
 * @name requestOptions
 * @param {http.IncomingMessage} request instance of http.IncomingMessage
 * @see Read in the {@link https://nodejs.org/en/docs/ |NodeJS docs} about class http.IncomingMessage
 * @returns {object}
 */
function requestOptions(request) {
  var requestUrl = this.url.parse(request.url, true);
  var requestMethod = request.method;
  var requestHeaders = request.headers;

  requestHeaders['accept-encoding'] = 'identity';

  var options = {
    hostname: requestUrl.hostname.toString(),
    port: requestUrl.port,
    path: requestUrl.path.toString(),
    method: requestMethod.toString(),
    headers: requestHeaders.toString()
  };

  return options;
};

/**
 * Defines right data encoding for incoming (when proxy-server get data
 * from the requested host) and outgoing (when proxy-server send it back to client browser) data.
 * @function
 * @name contentEncoding
 * @this {RequestHelper}
 * @param {array} headers rawHeaders property of the http.IncomingMessage instance
 * @see Read in the {@link https://nodejs.org/en/docs/ |NodeJS docs} docs about class http.IncomingMessage (HTTP moduel)
 and his property rawHeaders. See also about http.ServerResponse.
 * @returns {array} Returns array with two indexies - incoming and outgoing.
 * <p> returnedArray['incoming'] contains encoding for incoming data from requested host. </p>
 * <p> returnedArray['outgoing'] contains encoding for data that proxy server sends back to the client browser. </p>
 * <p> <b>Sometimes</b> these values can coincide, but you must use values for their cases.  </p>
 */
function contentEncoding(headers) {
  var encoding = [];

  var contentTypeIndex = headers.indexOf('Content-Type');
  var contentTypeValue = headers[contentTypeIndex + 1];

  var charsetRes = contentTypeValue.search(/charset=/i);

  if (charsetRes != -1) {
    encoding['outgoing'] = contentTypeValue.substring(charsetRes + 'charset='.length).toLowerCase();
  } else {
    encoding['outgoing'] = 'binary';
  }

  encoding['incoming'] = encoding['outgoing'];

  if (this.supportEncodings.indexOf(encoding['outgoing']) == -1) {
    encoding['incoming'] = 'binary';
  };

  return encoding;
};

/**
 * Get right information for the situation when user tries to get acces to forbidden sites.
 * @function
 * @name forbidden
 * @returns {array} Returns array with next indexies: status-code, headers, html-answer, encoding.
 * <p> returnedArray['status-code'] contains right HTTP response statis code. </p>
 * <p> returnedArray['headers'] values contains HTTP headers. </p>
 * <p> returnedArray['html-answer'] contains HTML code for user. </p>
 * <p> returnedArray['encoding'] contains right encoding for the HTML-answer. </p>
 */
function forbidden() {
  var result = [];
  result['status-code'] = 403;
  result['headers'] = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/html; charset=utf-8'
  };
  var html = [
    '<html>', '<head>', '<title>',
    'Доступ ограничен', '</title>', '</head>',
    '<body>', '<h1 align="center">', 'Доступ к запрашиваемому ресурсу ограничен.',
    '</h1>', '</body>', '</html>'
  ];
  result['html-answer'] = html.join('');
  result['encoding'] = 'utf8';
  return result;
};

RequestHelper.prototype.contentEncoding =  contentEncoding;
RequestHelper.prototype.forbidden = forbidden;
RequestHelper.prototype.isHostAllowed = isHostAllowed;
RequestHelper.prototype.requestOptions = requestOptions;

module.exports = RequestHelper;
