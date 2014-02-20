'use strict';
var nodyCrmModule = angular.module('nodycrm', ['ngResource' , 'ngSanitize', 'infinite-scroll']).constant('uiDateConfig', {});


nodyCrmModule.controller('rootCtrl', ['$scope','$rootScope', '$location', function ($scope,$rootScope,$location) {
	$scope.init = function (user) {
		$rootScope.current_user = user;
	};

	$rootScope.gotoNewUser = function() {
		$location.path('users/new');
	}

	$rootScope.gotoNewClient = function() {
		$location.path('clients/new');
	}

	$rootScope.gotoPrintClients = function(clients) {
		$location.path('clients/print');
	}

	$rootScope.logout = function() {
		window.location = '/logout';
	}

	$rootScope.gotoBack = function() { 
		window.history.back();
	};

	$rootScope.gotoClient = function(clientID) { 
		$location.path('clients/'+clientID);
	};

	$rootScope.gotoUser = function(userID) { 
		$location.path('users/'+userID);
	};
        
	$rootScope.printClientDetailList = function(userID) { 
		$location.path('clients/print/');
	};
        

	$rootScope.research = {};
	$rootScope.research.searchname = '';
	$rootScope.research.searcharchive = false;
	$rootScope.research.searchuser = '';
	$rootScope.research.searchnouser = false;
	$rootScope.research.searchstage = '';
	$rootScope.research.searchactivity = '';
	$rootScope.research.searchnoactivity = false;
	$rootScope.research.searchdatefrom = null;
	$rootScope.research.searchdatefrom_en = null;
	$rootScope.research.searchdateto = null;
	$rootScope.research.searchdateto_en = null;
	$rootScope.research.searchnoactions = false;
	$rootScope.research.searchpostalcode = '';
	$rootScope.research.searchcity = '';

	$rootScope.research.order = {
		sort: 'name',
		order: 'asc'
	}

}]);

// NAVIGATION

nodyCrmModule.controller('listnavCtrl', ['$scope', '$location','$rootScope', function ($scope, $location, $rootScope) {
	$scope.navClass = function (page) {
		var currentRoute = $location.path().substring(1) || 'home';
		return page === currentRoute ? 'active' : '';
	};
}]);


// CLIENTS

nodyCrmModule.controller('ClientListCtrl', ['$scope','$http','Client','$rootScope', function($scope , $http ,Client, $rootScope) {
	var limit = 50;
	var offset = 0;
	var lock = false; //lock the query so only one query is fired at a time

	$scope.clients = Client.query({limit:limit,offset:offset},
		function(response) {
			$scope.isloaded = true;
		}
		);
	$http.get('/api/clients?count=true')
	.success(function(response) {
		$scope.count = response.count;
	})
	.error(function(response) {
		$scope.notification = 'Error !';
	})

	function checkSearchDate() {
		if ($rootScope.research.searchnoactions) {
			$rootScope.research.searchdatefrom = null;
			$rootScope.research.searchdatefrom_en = null;
			$rootScope.research.searchdateto = null;
			$rootScope.research.searchdateto_en = null;
			return;
		}
		if ($rootScope.research.searchdatefrom && $rootScope.research.searchdateto) {
			if ($rootScope.research.searchdatefrom > $rootScope.research.searchdateto) {
				$rootScope.research.searchdatefrom = $rootScope.research.searchdateto;
			}
		}
		$rootScope.research.searchdatefrom_en =  formatEn($rootScope.research.searchdatefrom);
		$rootScope.research.searchdateto_en =  formatEn($rootScope.research.searchdateto);
	}
	
	function formatEn(date) {
		if (date) {
			return (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear();
		}
		else
			return null;

	}

	$scope.search = function () {
		checkSearchDate();
		offset = 0;
		Client.query({
			limit:limit,
			offset:offset,
			name:$rootScope.research.searchname,
			archive:$rootScope.research.searcharchive,
			user:$rootScope.research.searchuser,
			nouser:$rootScope.research.searchnouser,
			stage:$rootScope.research.searchstage,
			activity:$rootScope.research.searchactivity,
			noactivity:$rootScope.research.searchnoactivity,
			last_action_date_from:$rootScope.research.searchdatefrom,
			last_action_date_to:$rootScope.research.searchdateto,
			noactions:$rootScope.research.searchnoactions,
			sort:$rootScope.research.order.sort,
			order:$rootScope.research.order.order,
            postalcode:$rootScope.research.searchpostalcode,
            city:$rootScope.research.searchcity
		},
		function(response) {
			$scope.clients = response;
		}
		);
	}

	$scope.loadMore = function() {
		if (!lock) {
			lock = true;
			offset += limit;
			// Client.query({limit:limit,offset:offset} , function(response) {
			Client.query({
				limit:limit,
				offset:offset,
				name:$rootScope.research.searchname,
				archive:$rootScope.research.searcharchive,
				user:$rootScope.research.searchuser,
				nouser:$rootScope.research.searchnouser,
				stage:$rootScope.research.searchstage,
				activity:$rootScope.research.searchactivity,
				noactivity:$rootScope.research.searchnoactivity,
				last_action_date_from:$rootScope.research.searchdatefrom,
				last_action_date_to:$rootScope.research.searchdateto,
				noactions:$rootScope.research.searchnoactions,
				sort:$rootScope.research.order.sort,
				order:$rootScope.research.order.order,
	            postalcode:$rootScope.research.searchpostalcode,
	            city:$rootScope.research.searchcity
			}, function(response) {
				if (response.length > 0) {
					$scope.clients = $scope.clients.concat(response);
					lock = false;
				}
			});
		}
	};

	$scope.setOrder = function(order) {
		if (order == $rootScope.research.order.sort) {
			$rootScope.research.order.order = ($rootScope.research.order.order == 'asc' ? 'desc' : 'asc');
		}
		else {
			$rootScope.research.order.order = 'asc';
			$rootScope.research.order.sort = order;	
		}
		$rootScope.research();
	}
}]);

nodyCrmModule.controller('TextSimpleCtrl', function($scope) {
	$scope.user = {
		name: 'awesome user'
	};  
});

nodyCrmModule.controller('ClientPrintCtrl', ['$scope','$http','$location', '$rootScope','Client', function($scope , $http , $location , $rootScope, Client) {
	$scope.currentDateTime = new Date();
	checkSearchDate();
	Client.query({
		actions:true,
		name:$rootScope.research.searchname,
		archive:$rootScope.research.searcharchive,
		user:$rootScope.research.searchuser,
		nouser:$rootScope.research.searchnouser,
		stage:$rootScope.research.searchstage,
		activity:$rootScope.research.searchactivity,
		noactivity:$rootScope.research.searchnoactivity,
		last_action_date_from:$rootScope.research.searchdatefrom,
		last_action_date_to:$rootScope.research.searchdateto,
		noactions:$rootScope.research.searchnoactions,
		sort:$rootScope.research.order.sort,
		order:$rootScope.research.order.order,
        postalcode:$rootScope.research.searchpostalcode,
        city:$rootScope.research.searchcity
	},
	function(response) {
		$scope.clients = response;
	}
	);

	function checkSearchDate() {
		if ($rootScope.research.searchnoactions) {
			$rootScope.research.searchdatefrom = null;
			$rootScope.research.searchdatefrom_en = null;
			$rootScope.research.searchdateto = null;
			$rootScope.research.searchdateto_en = null;
			return;
		}
		if ($rootScope.research.searchdatefrom && $rootScope.research.searchdateto) {
			if ($rootScope.research.searchdatefrom > $rootScope.research.searchdateto) {
				$rootScope.research.searchdatefrom = $rootScope.research.searchdateto;
			}
		}
		$rootScope.research.searchdatefrom_en =  formatEn($rootScope.research.searchdatefrom);
		$rootScope.research.searchdateto_en =  formatEn($rootScope.research.searchdateto);
	}
	
	function formatEn(date) {
		if (date) {
			return (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear();
		}
		else
			return null;

	}
}]);

nodyCrmModule.controller('ClientDetailCtrl', ['$scope','$http','Client','$routeParams','$location','User','$filter', function($scope , $http , Client , $routeParams , $location , User , $filter) {
	$scope.currentDateTime = new Date();
	// $http.get('/api/clients/'+$routeParams.id)
	// .success(function(response) {
	// 	$scope.clients = response;
	// })
	// .error(function(response) {
	// 	$scope.notification = 'Error !';
	// });
	$scope.client = Client.get({clientID:$routeParams.id},function() {
		if ($scope.client.description){
			var desc = $scope.client.description.split('\n');
			$scope.client.description = desc.join('<br>');
		}

	});
	$scope.newAction = false;
	$scope.editAction = {id: false};
	
	$scope.gotoEdit = function () {
		$location.path('clients/edit/'+$scope.client._id);
	}

	$scope.createAction = function () {
		$scope.currentDateTime = new Date();
		if ($scope.newAction && $scope.newAction.length > 0) {
			$http.post('/api/actions/clients/'+$scope.client._id , {comment: $scope.newAction})
			.success(function(response) {
				if (!$scope.client.actions)
					$scope.client.actions = [];
				$scope.client.actions.push(response.data);
				$scope.notification = 'action created'
			})
			.error(function(response) {
				$scope.notification = 'Error !';
			})	
		}
	}



	$scope.selectAction = function (actionId) {
		var i=0;
	    // search the action
	    while(i < $scope.client.actions.length && $scope.client.actions[i]._id != actionId) {
	    	i = i + 1;
	    }
	    if ($scope.client.actions[i]._id == actionId) {
	    	$scope.editAction = {index: i, id: actionId, data: {comment: $scope.client.actions[i].comment}};  
	    	$scope.client.actions[i].comment;
	    }
	}

	$scope.saveaction = function (id) {
		var i=0;
		// lookup action in actions
		while(i < $scope.client.actions.length && $scope.client.actions[i]._id != id) {
			i = i + 1;
		}
		if ($scope.client.actions[i]._id == id) {
			var data = {comment: $scope.client.actions[i].comment};  
			$http.post('/api/actions/'+id+'/clients/'+$scope.client._id , data)
			.success(function(response) {
				$scope.client.actions[$scope.editAction.index] = response.data;
				$scope.notification = 'action edited'
				$scope.editAction = false;
			})
			.error(function(response) {
				$scope.notification = 'Error !';
			})  
		}
	}
}]);

nodyCrmModule.controller('ClientEditCtrl', ['$scope','$http','Client','$routeParams','$location','User', function($scope , $http , Client , $routeParams, $location, User ) {
	$scope.client = Client.get({clientID:$routeParams.id},function() {
		if ($scope.client.product_send_date)
			$scope.client.product_send_date = new Date($scope.client.product_send_date);
		$scope.isloaded = true;
		$scope.users = User.query(setSelectedUser);
	});
	$scope.clientChanged = false;

	function setSelectedUser() {
		if (!$scope.current_user.admin)
			return;
		if ($scope.client._user) {
			var i = 0;
			while ((i < $scope.users.length) && ($scope.users[i]._id != $scope.client._user._id)) {
				i++;
			}
			if ($scope.users[i]._id == $scope.client._user._id) {
				$scope.client._user = $scope.users[i];
			}
		}
	}

	$scope.gotoDetail = function () {
		$location.path('clients/'+$scope.client._id);
	}

	$scope.save = function () {
		// hack/fix : need to save data for later
		var clientTemp = angular.copy($scope.client)
		// Send only the user_id
		if ($scope.client._user)
			$scope.client._user = $scope.client._user._id;
		$scope.client.$save(
			{clientID: $scope.client._id},
			function success(response) {
				$scope.gotoDetail();

			},
			function error(response) {
				$scope.notification = 'Error !!!';
			}
			);
		// hack/fix : angular delete the ressource after a save, need to push
		// the client
		$scope.client = clientTemp; 
		// The user of the client need to be a ref on users
		setSelectedUser();
	}

	$scope.duplicate_address = function() {
		$scope.client.delivery_address = angular.copy($scope.client.address);
	}


}]);

nodyCrmModule.controller('ClientNewCtrl', ['$scope','$http','Client', '$location', function($scope , $http , Client , $location ) {
	$scope.client = new Client();
	$scope.client.stage = 'Prospect';
	$scope.save = function () {
		$scope.client.$save(
			function success(response) {
				$location.path('clients/edit/'+response.client._id);
			},
			function error(response) {
				// alert(response.data.status);
			}
			);
	}
}]);

// COMMERCIAUX
nodyCrmModule.controller('UserListCtrl', ['$scope','$http','User','$location', function($scope , $http ,User,$location) {
	$scope.users = User.query(function() {
		$scope.isloaded = true;
	});
}]);

nodyCrmModule.controller('UserDetailCtrl', ['$scope','$http','User','$routeParams','$location','Client', function($scope , $http , User , $routeParams , $location , Client) {
	$scope.filtered = {
		clients:[],
		prospects:[]
	};
	$scope.user = User.get({userID:$routeParams.id},function() {
		Client.query({
			user_id:$scope.user._id,
		},
		function(response) {
			$scope.clients = response;
		}
		);

		$http.get('/api/actions/user/'+$scope.user._id)
		.success(function(response) {
			$scope.actions = response;
		})
		.error(function(response) {
			$scope.notification = 'Error !';
		})
	});
	

	$scope.gotoEdit = function () {
		$location.path('users/edit/'+$scope.user._id);
	}
}]);

nodyCrmModule.controller('UserEditCtrl', ['$scope','$http','User','$routeParams','$location', function($scope , $http , User , $routeParams , $location ) {
	$scope.user = User.get({userID:$routeParams.id},function() {
		$scope.isloaded = true;
	});

	$scope.gotoDetail = function () {
		$location.path('users/'+$scope.user._id);
	}


	$scope.cancel = function() {
		$scope.gotoDetail();
	}

	$scope.save = function () {
		// hack/fix : need to save data for later
		var userTemp = angular.copy($scope.user)
		$scope.user.$save(
			{userID: $scope.user._id},
			function success(response) {
				$scope.gotoDetail();
			},
			function error(response) {
				$scope.notification = 'Error !!!';
			}
			);
		// hack/fix : angular delete the ressource after a save
		$scope.user = userTemp; 
	}
}]);

nodyCrmModule.controller('UserNewCtrl', ['$scope','$http','User', '$location', function($scope , $http , User , $location ) {
	$scope.user = new User();
	$scope.save = function () {
		$scope.user.$save(
			function success(response) {
				if (response.user) {
					$location.path('users/'+response.user._id);
				}
			},
			function error(response) {
				alert(response.data.status);
			}
			);
	}
}]);

// Ressources
nodyCrmModule.factory('Client' , ['$resource' , function($resource) {
	return $resource('/api/clients/:clientID', {}, {
	    // follower: {method:'GET', params:{clientID:'@id'}, isArray:true}
	});
}]);

nodyCrmModule.factory('User' , ['$resource' , function($resource) {
	return $resource('/api/users/:userID', {}, {
	});
}]);



// routes
nodyCrmModule.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/clients', {templateUrl: '/app/views/client/list.html',   controller: 'ClientListCtrl'}).
	when('/clients/new', {templateUrl: '/app/views/client/new.html',   controller: 'ClientNewCtrl'}).
	when('/clients/print', {templateUrl: '/app/views/client/print.html',   controller: 'ClientPrintCtrl'}).
	when('/clients/:id', {templateUrl: '/app/views/client/detail.html',   controller: 'ClientDetailCtrl'}).
	when('/clients/edit/:id', {templateUrl: '/app/views/client/edit.html',   controller: 'ClientEditCtrl'}).
	when('/users', {templateUrl: '/app/views/user/list.html',   controller: 'UserListCtrl'}).
	when('/users/new', {templateUrl: '/app/views/user/new.html',   controller: 'UserNewCtrl'}).
	when('/users/:id', {templateUrl: '/app/views/user/detail.html',   controller: 'UserDetailCtrl'}).
	when('/users/edit/:id', {templateUrl: '/app/views/user/edit.html',   controller: 'UserEditCtrl'}).
	otherwise({redirectTo: '/clients'});
}]);

nodyCrmModule.directive('dropMultiselect', function () {
	return {
		restrict: 'A',
		scope: {
			options: '=',
			model: '='
		},
		link: function (scope, elem, attrs) {
			var element = angular.element(elem);
			for (var i = 0; i < scope.options.length ; i++) {
				element.append('<option value="'+scope.options[i]+'">'+scope.options[i]+'</option>');
			}
			element.multiselect({
				buttonClass: 'btn btn-default',
				enableCaseInsensitiveFiltering:true,
				maxHeight: 290

			});
			element.change(function() {
				scope.model = $(this).val();
				scope.$apply()
			})
			scope.$watch('model', function(newVal, oldVal) {
				if (newVal) 
					element.multiselect('select', newVal);
			});
		},
	}
});

nodyCrmModule.directive('sortingFlag', function () {
	return {
		restrict: 'A',
		scope: {
			order: '=',
			col: '@'
		},
		replace: true,
		template: '<span ng-show="order.sort == col">'+
		'<span ng-show="order.order == \'asc\'" ><span class="sortflag glyphicon glyphicon-chevron-down"></span></span>'+
		'<span ng-show="order.order == \'desc\'" ><span class="sortflag glyphicon glyphicon-chevron-up"></span></span>'+
		'</span>'
	}
});

nodyCrmModule.directive('editableAction', function () {
	return {
		restrict: 'A',
		scope: {
			action: '=',
			ondone: '&'
			// callback : '&action',
		},
		template: '<div>'+
		'<div class="comment" ng-show="showMe">{{action.comment}}</div>'+
		'<div ng-show="!showMe"><input type="text" ng-model="action.comment" class="form-control" id="action_comment" placeholder="Action"></div>'+
		'</div>',
		link: function (scope, elem, attrs) {
			var comment_initial = angular.copy(scope.action.comment);
			scope.showMe = true;
			var input = elem.find('input');
			var comment = elem.find('.comment');
			comment.bind("click", toggle);
			input.bind("keydown", save);
			input.bind("focusout", save);

			function toggle() {
				scope.$apply(function() {
					scope.showMe = !scope.showMe;	
				});
				input.focus();
			}
			function save(e) {
				if (scope.action.comment.length > 0) {
					if (e.which == 13 || e.type == 'focusout') {
						scope.$apply(function(){
							scope.showMe = true;
							scope.ondone({id: scope.action._id});
						});
					}
				}
				else {
					scope.$apply(function(){
						scope.showMe = true;
						scope.action.comment = comment_initial;
					});
				}
			}
	},
}
});

nodyCrmModule.directive('newAction', function () {
	return {
		restrict: 'A',
		scope: {
			model: '=',
			onsave: '&',
			// callback : '&action',
		},
		link: function (scope, elem, attrs) {
			$(elem).bind("keydown", function(e) {
				if (e.which == 13) {
					e.preventDefault();
					if (elem.val()) {
						scope.model = elem.val();
						scope.$apply();	
						scope.onsave();
					} 
					elem.focusout();
				}
			});

			elem.focusout(function() {
				elem.val('');
			});

		},
	}
});

nodyCrmModule.directive('switch', function () {
	return {
		restrict: 'A',
		scope: {
			data: '=',
		},
		template: '<div class="make-switch" data-on-label="Actif" data-off-label="Archive">'+
		'<input ng-model="data" type="checkbox">'+
		'</div>',
		link: function (scope, elem, attrs) {
			var elemSwitch = elem.find('.make-switch');
			attrs.on ? elemSwitch.attr('data-on-label',attrs.on):false;
			attrs.off ? elemSwitch.attr('data-off-label',attrs.off):false;
			attrs.class ? elemSwitch.addClass(attrs.class):false;
			
			elemSwitch.bootstrapSwitch();
			scope.$watch('data', function(newVal, oldVal) {
				if (newVal) {
					var val = newVal;
					if (attrs.valon && (attrs.valon == newVal))
						val = true;
					if (attrs.valoff && (attrs.valoff == newVal))
						val = false;
					elemSwitch.bootstrapSwitch('setState', val);
				}
			});

			elemSwitch.on('switch-change', function (e, data) {
				if(!(scope.$$phase || scope.$root.$$phase)) {
					scope.$apply(function() {
					if (attrs.valon && attrs.valoff)
					  	scope.data = data.value ? attrs.valon : attrs.valoff ;
					else	
						scope.data = data.value
				  });	
				}
			});
	},
}
});

/*global angular */
/*
 jQuery UI Datepicker plugin wrapper

 @note If ≤ IE8 make sure you have a polyfill for Date.toISOString()
 @param [ui-date] {object} Options to pass to $.fn.datepicker() merged onto uiDateConfig
 */


 nodyCrmModule.directive('uiDate', ['uiDateConfig', '$timeout', function (uiDateConfig, $timeout) {
 	'use strict';
 	var options;
 	options = {};
 	angular.extend(options, uiDateConfig);
 	return {
 		require:'?ngModel',
 		link:function (scope, element, attrs, controller) {
 			var getOptions = function () {
 				return angular.extend({}, uiDateConfig, scope.$eval(attrs.uiDate));
 			};
 			var initDateWidget = function () {
 				var showing = false;
 				var opts = getOptions();

        // If we have a controller (i.e. ngModelController) then wire it up
        if (controller) {
          // Set the view value in a $apply block when users selects
          // (calling directive user's function too if provided)
          var _onSelect = opts.onSelect || angular.noop;
          opts.onSelect = function (value, picker) {
          	scope.$apply(function() {
          		showing = true;
          		controller.$setViewValue(element.datepicker("getDate"));
          		_onSelect(value, picker);
          		element.blur();
          	});
          };
          opts.beforeShow = function() {
          	showing = true;
          };
          opts.onClose = function(value, picker) {
          	showing = false;
          };
          element.on('blur', function() {
          	if ( !showing ) {
          		scope.$apply(function() {
          			element.datepicker("setDate", element.datepicker("getDate"));
          			controller.$setViewValue(element.datepicker("getDate"));
          		});
          	}
          });

          // Update the date picker when the model changes
          controller.$render = function () {
          	var date = controller.$viewValue;
          	if ( angular.isDefined(date) && date !== null && !angular.isDate(date) ) {
          		throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
          	}
          	element.datepicker("setDate", date);
          };
      }
        // If we don't destroy the old one it doesn't update properly when the config changes
        element.datepicker('destroy');
        // Create the new datepicker widget
        element.datepicker(opts,$.datepicker.regional[ "fr" ]);
        if ( controller ) {
          // Force a render to override whatever is in the input text box
          controller.$render();
      }
  };
      // Watch for changes to the directives options
      scope.$watch(getOptions, initDateWidget, true);
  }
};
}
])

.constant('uiDateFormatConfig', '')
.directive('uiDateFormat', ['uiDateFormatConfig', function(uiDateFormatConfig) {
	var directive = {
		require:'ngModel',
		link: function(scope, element, attrs, modelCtrl) {
			var dateFormat = attrs.uiDateFormat || uiDateFormatConfig;
			if ( dateFormat ) {
        // Use the datepicker with the attribute value as the dateFormat string to convert to and from a string
        modelCtrl.$formatters.push(function(value) {
        	if (angular.isString(value) ) {
        		return jQuery.datepicker.parseDate(dateFormat, value);
        	}
        	return null;
        });
        modelCtrl.$parsers.push(function(value){
        	if (value) {
        		return jQuery.datepicker.formatDate(dateFormat, value);
        	}
        	return null;
        });
    } else {
        // Default to ISO formatting
        modelCtrl.$formatters.push(function(value) {
        	if (angular.isString(value) ) {
        		return new Date(value);
        	}
        	return null;
        });
        modelCtrl.$parsers.push(function(value){
        	if (value) {
        		return value.toISOString();
        	}
        	return null;
        });
    }
}
};
return directive;
}]);