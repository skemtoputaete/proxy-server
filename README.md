Simple proxy server
=====================
Description of the files in this repository
-----------------------------------

Name of the file | Contents
-----------------|-----------------
send_request.js  |First version of the proxy server. Now it's just a draft
request.js       |Second version of the proxy server. Works fine, but structure of the code is terrible.
proxy.js         |Third version of the proxy server. Works fine, did some refactor and part of the features now in the special module
rh.js            |Module for third version of the proxy server. rh stands for request helper.

Description of the rh module
-----------------------------------

The rh module contains some code that need for requests, but for the best understanding it was placed in the module.

This module contains implementation of the rh class.

### Description of the methods in the rh module

rh class has the next methods:

1. `isHostAllowed`

   Use it if you want be sure that user of the proxy server don't try to get acces for forbidden sites.
   This method has one argument `url` that is property `url` of `http.IncomingMessage` instance. It returns `true` if user has acces to the requested host, and returns `false` otherwise.

2. `requestOptions`

   Use it for get the right options when using `http.request`
   This method has one argument `request` that is instance of `http.IncomingMessage`. It returns object with correct properties for the request.

3. `contentEncoding`

   Use it for define the right data encoding, when you get data from request server and when you send data back to the user.
   This method has one argument `headers` that is property `rawHeaders` of `http.IncomingMessage` instance.
   It returns an array `encoding` with properties `outgoing` and `incoming`. The `outgoing` contains encoding which you should use when send data back to user. The `incoming` property contains encoding for getting data from the server.

4. `forbidden`

   Use it for right status code, headers, html answer and answer encoding when user tries to get access for forbidden sites.
   This metohd has no arguments. It returns the array with correct properties `status-code`, `html-answer`, `headers` and `encoding`.
