var initData = {phones:[{
        name: '谢霆锋',
        phone: 13538291345,
        type: '家人',
        joinTime: '2014-05-06 10:05',
        id: 1
      },
      {
        name: '张柏芝',
        phone: 13929384720,
        type: '家人',
        joinTime: '2014-05-06 10:15',
        id: 2
      },
      {
        name: '蔡卓妍',
        phone: 15849284751,
        type: '同事',
        joinTime: '2014-05-06 10:25',
        id: 3
      },
      {
        name: '梁朝伟',
        phone: 13457483911,
        type: '家人',
        joinTime: '2014-05-06 10:35',
        id: 4
      },
      {
        name: '钟欣潼',
        phone: 18311938274,
        type: '朋友',
        joinTime: '2014-05-06 10:45',
        id: 5
      },
      {
        name: '陈冠希',
        phone: 18639482716,
        type: '朋友',
        joinTime: '2014-05-06 10:55',
        id: 6
      }], lastId: 6}, data;

var app = angular.module('app', ['ngRoute']);
  app.config(function($routeProvider) {
    $routeProvider.
        when('/', {
          templateUrl: '/tpl/home.html',
          controller: 'homeCtrl'
        }).
        when('/list', {
          templateUrl: '/tpl/list.html',
          controller: 'listCtrl'
        }).
        when('/post', {
          templateUrl: '/tpl/post.html',
          controller: 'postCtrl'
        }).
        when('/view/:id', {
          templateUrl: '/tpl/view.html',
          controller: 'viewCtrl'
        }).
        otherwise({
          redirectTo: '/'
        });//如果任何路径都没匹配到 会触发otherwise
  });

  app.factory('APPstorage', function(){
    return {
      get: function(){
        var appData = JSON.parse(localStorage.getItem('app') || '{}');
        if(appData.once){
          return appData;
        }else{
          initData.once = true;
          localStorage.setItem('app', JSON.stringify(initData));
          return initData;
        }
      },
      set: function(phone){
        localStorage.setItem('app', JSON.stringify(phone));
      }
    }
  });
  //自定义表单校验
  var phoneReg = /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
  app.directive('phoneNum', function(){
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl){
        ctrl.$parsers.push(function(viewValue) {
          if(!phoneReg.test(viewValue)){
            ctrl.$setValidity('phoneNum', false);
            return viewValue;
          }else{
            var ck = find(viewValue, 'phone');
            if(ck > -1){
              ctrl.$setValidity('phoneNum', false);
              return viewValue;
            }else{
              ctrl.$setValidity('phoneNum', true);
              return viewValue;
            }
          }
        });
      }
    }
  });

  app.directive('phoneFocus', function ($timeout) {
      return function (scope, elem, attrs) {
          scope.$watch(attrs.phoneFocus, function (val) {
              if (val) {
                  $timeout(function () {
                      elem[0].focus();
                  }, 0, false);
              }
          });
      };
  });

  app.controller('global', function($scope, $location){
    $scope.location = $location;
    var nav;
    $scope.$watch('location.path()', function(path){
      nav = {
        isHome: false,
        isList: false,
        isPost: false
      };
      switch(path){
        case '/':
          nav.isHome = true;
          $scope.title = '首页';
          break;
        case '/list':
          nav.isList = true;
          $scope.title = '电话列表';
          break;
        case '/post':
          nav.isPost = true;
          $scope.title = '添加通讯录';
      }
      $scope.nav = nav;
    });
  });

  app.controller('homeCtrl', function($scope, APPstorage){
    data = APPstorage.get();
    $scope.phones = data.phones.slice(0, 10);
  });

  app.controller('listCtrl', function($scope, APPstorage){
    data = APPstorage.get();
    var lastId = data.lastId,
        phones = data.phones,
        origin;

    $scope.phones = phones;
    $scope.order = 'id';
    $scope.edit = null;
    
    $scope.remove = function(id){
      var index = find(id);
      if(index != -1){
        phones.splice(index, 1);
        APPstorage.set(data);
      }
    }

    $scope.dbck = function(phone, key){
      $scope.edit = {};
      $scope.edit.phone = phone;
      $scope.edit.key = key;
      origin = phone[key];
    }

    $scope.cancel = function(phone){
      phone[$scope.edit.key] = origin;
      origin = null;
      $scope.edit = null;
    }
    $scope.save = function(phone){
      /*
        origin这是老数据
        这里的phone为新的数据
      */
      var key = $scope.edit.key,
          Reg = {
            'name': /(^[A-Za-z0-9]{2,20}$)|(^[\u4E00-\u9FA5]{2,8}$)/,
            'type': /(^[A-Za-z0-9]{2,20}$)|(^[\u4E00-\u9FA5]{2,8}$)/,
            'phone': phoneReg
          };

      if(!Reg[key].test(phone[key])){
        alert('输入不合法');
        return;
      }
      if(phone[key] !== origin){
        origin = null;
        $scope.edit = null;
        APPstorage.set(data);
        return;
      }
      $scope.cancel(phone);
    }
  })

  app.controller('postCtrl',function($scope, $location, APPstorage){
    data = data || APPstorage.get();
    var lastId = data.lastId;
    
    $scope.save = function(){
      lastId++;

      $scope.user.id = lastId;
      $scope.user.joinTime = format(new Date());
      data.phones.push($scope.user);
      data.lastId = lastId;
      APPstorage.set(data);
      $location.path('list');
    }
    $scope.reset = function(){
      $scope.user = angular.copy({});
    }
  })

  app.controller('viewCtrl', function($scope, $routeParams, APPstorage){
    data = data || APPstorage.get();
    var i = find($routeParams.id);
    $scope.phone = data.phones[i];
  })


  function find(id, key){
    var key = key || 'id', d = data.phones;
    for(var i=0,len=d.length;i<len;i++){
      if(d[i][key] == id)return i;
    }
    return -1;
  }
  
  function zero(n){
    return ('0' + n).slice(-2);
  }

  function format(date){
    return date.getFullYear() + '-' + zero(date.getMonth()+1) + '-' + zero(date.getDate()) + ' ' + zero(date.getHours()) + ':' + zero(date.getMinutes());
  }
