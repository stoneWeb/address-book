var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    mime = require('./mime').types,
    html = '<!doctype html>' +
            '<html lang="en" ng-app="app" ng-controller="global">' +
            '<head>' +
              '<meta charset="UTF-8">' +
              '<title ng-bind="title"></title>' +
              '<script src="http://code.angularjs.org/1.2.5/angular.min.js"></script>' +
              '<script src="http://code.angularjs.org/1.2.5/angular-route.min.js"></script>' +
              '<link rel="stylesheet" href="/css/bootstrap.min.css">' +
              '<link rel="stylesheet" href="/css/site.css">' +
            '</head>' +
            '<body>' +
              '<ul class="nav nav-pills">' +
                '<li ng-class="{active: nav.isHome}"><a href="#/">首页</a></li>' +
                '<li ng-class="{active: nav.isList}"><a href="#/list">列表</a></li>' +
                '<li ng-class="{active: nav.isPost}"><a href="#/post">发布</a></li>' +
              '</ul>' +
              '<div id="wrap" ng-view>' +
              '</div>' +
              '<script src="/js/app.js"></script>' +
            '</body>' +
            '</html>';

//简单实现一个文件服务器
http.createServer(function(req, res){
  var pathname = url.parse(req.url).pathname,
      realPath = path.join('static', path.normalize(pathname.replace(/\.\./g, ""))),
      ext = path.extname(realPath);//path.extname来获取文件的后缀名 包含.
      ext = ext?ext.slice(1):'unknow';
  if(pathname == '/'){
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
    res.write(html);
    res.end();
    return;
  }
  if(ext == 'unknow'){
    rt404(res);
  }else{
    path.exists(realPath, function(ex){//检测文件是否存在于服务器
      if(!ex){
        rt404(res);
        return;
      }
        fs.readFile(realPath, "binary", function(err, file){
          if(err){
            res.writeHead(500, {'Content-Type': 'text/plain;charset=utf-8'});
            res.end(err);
          }else{
            res.writeHead(200, {'Content-Type': (mime[ext] || 'text/plain')+';charset=utf-8'});
            res.write(file, 'binary');
            res.end();
          }
        });
    });
  }
}).listen(5678);

function rt404(res){
  res.writeHead(404, {'Content-Type': 'text/plain;charset=utf-8'});
  res.write('404 not found');
  res.end();
}