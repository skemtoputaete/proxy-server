// Данный модуль описывает класс rh (request helper)
// В классе реализованы методы, которые необходимы
// для выполнения запросов прокси сервера

// Задачи решаемые модулем rh:
// 1. Формирует необходимые данные для отправки запроса на удаленный сервер
// 2. Определяет правильную кодировку данных для отправки их обратно клиенту
//    и для их получения
// 3. Проверяет доступ к запрашиваемым ресурсам

function rh() {
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

// url - свойство url класса http.IncomingMessage
// return true, если сайт разрешен для посещения
// return false, в противоположной ситуации
rh.prototype.isHostAllowed = function(url) {
  var requestUrl = this.url.parse(url, true);

  var hostname = requestUrl.hostname.toString();
  if (this.denyHosts.indexOf(hostname) != -1) {
    return false;
  }

  return true;
};

// url - свойство url класса http.IncomingMessage
// Метод возвращает необходимые данные для выполнения запроса
rh.prototype.requestOptions = function(request) {
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

// headers - массив rawHeaders
// Метод возращает 2 кодировки:
// 1. Используется при получении данных от сервера
// 2. Используется при отправке данных браузеру
rh.prototype.contentEncoding = function(headers) {
  var encoding = [];

  var contentTypeIndex = headers.indexOf('Content-Type');
  var contentTypeValue = headers[contentTypeIndex + 1];

  var charsetRes = contentTypeValue.search(/charset=/i);

  // Определяем кодировку, используемую при отправке данных браузеру
  if (charsetRes != -1) {
    encoding['outgoing'] = contentTypeValue.substring(charsetRes + 'charset='.length).toLowerCase();
  } else {
    encoding['outgoing'] = 'binary';
  }

  encoding['incoming'] = encoding['outgoing'];

  // Если кодировка, используемая для отправки данных браузеру
  // не поддерживается NodeJS, необходимо определить кодировку
  // для поступающих от сервера данных
  if (this.supportEncodings.indexOf(encoding['outgoing']) == -1) {
    encoding['incoming'] = 'binary';
  };

  return encoding;
};

rh.prototype.forbidden = function() {
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

var requestHelper = new rh();
module.exports = requestHelper;
