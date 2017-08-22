=====================
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

1. ```javascript
   isHostAllowed
   ```

  Use it if you want be sure that user of the proxy server don't try to get acces for forbidden sites.

2. ```javascript
   requestOptions
   ```

   Use it for get the right options when using
   ```javascript
   http.request
   ```

3. ```javascript
   contentEncoding
   ```

   Use it for define the right data encoding.

4. ```javascript
   forbidden
   ```

   Use it for right status code, headers, html answer and answer encoding when user tries to get access for forbidden sites.
