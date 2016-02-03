QuestioApp = QuestioApp ? QuestioApp : {};

QuestioApp.directive("contenteditable", function() {
    return {
        require: "ngModel",
        link: function(scope, element, attrs, ngModel) {

            function read() {
                ngModel.$setViewValue(element.html());
            }

            ngModel.$render = function() {
                element.html(ngModel.$viewValue || "");
            };

            element.bind("blur keyup change", function() {
                scope.$apply(read);
            });
        }
    };
});

QuestioApp.directive('modalDialog', function() {
    return {
        restrict: 'E',
        scope: {
            show: '='
        },
        replace: true,
        transclude: true,
        link: function(scope, element, attrs) {
            scope.dialogStyle = {};
            if (attrs.width)
                scope.dialogStyle.width = attrs.width;
            if (attrs.height)
                scope.dialogStyle.height = attrs.height;
            scope.hideModal = function() {
                scope.show = false;
            };
        },
        template: "<div class='ng-modal settings-panel-allowed' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog sentinel-bordered' ng-style='dialogStyle'><span class='ng-modal-title' ng-show='dialogTitle && dialogTitle.length' ng-bind='dialogTitle'></span><div class='ng-modal-close' ng-click='hideModal()'><div ng-bind-html='closeButtonHtml'></div></div><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
    };
});

QuestioApp.directive('validNumber', function() {
    return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            if(!ngModelCtrl) {
                return;
            }

            ngModelCtrl.$parsers.push(function(val) {
                if (angular.isUndefined(val)) {
                    var val = '';
                }
                var clean = val.replace( /[^0-9]+/g, '');
                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });

            element.bind('keypress', function(event) {
                if(event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    };
});

QuestioApp.directive('noNumberAllowed', function() {
    return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            if(!ngModelCtrl) {
                return;
            }

            ngModelCtrl.$parsers.push(function(val) {
                if (angular.isUndefined(val)) {
                    var val = '';
                }
                var clean = val.replace( /[0-9]+/g, '');
                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });
        }
    };
});

QuestioApp.directive('onFinishTableRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
//            if (scope.$last === true) {
//                $timeout(function () {
//                    scope.$emit('ngTableRenderFinished');
//                });
//            }
            $timeout(function () {
                scope.$emit('ngTableRenderFinished');
            });
        }
    }
});

QuestioApp.directive('onFinishTimepickerRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('timePickerRendered');
                });
            }
        }
    }
});


QuestioApp.directive('optionsDisabled', function($parse) {
    var disableOptions = function(scope, attr, element, data, fnDisableIfTrue) {
        // refresh the disabled options in the select element.
        $("option[value!='?']", element).each(function(i, e) {
            var locals = {};
            locals[attr] = data[i];
            $(this).attr("disabled", fnDisableIfTrue(scope, locals));
        });
    };
    return {
        priority: 0,
        require: 'ngModel',
        link: function(scope, iElement, iAttrs, ctrl) {
            // parse expression and build array of disabled options
            var expElements = iAttrs.optionsDisabled.match(/^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
            var attrToWatch = expElements[3];
            var fnDisableIfTrue = $parse(expElements[1]);
            scope.$watch(attrToWatch, function(newValue, oldValue) {
                if(newValue)
                    disableOptions(scope, expElements[2], iElement, newValue, fnDisableIfTrue);
            }, true);
            // handle model updates properly
            scope.$watch(iAttrs.ngModel, function(newValue, oldValue) {
                var disOptions = $parse(attrToWatch)(scope);
                if(newValue)
                    disableOptions(scope, expElements[2], iElement, disOptions, fnDisableIfTrue);
            });
        }
    };
});

QuestioApp.directive('ngdatepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
            $(function(){
                element.datepicker({
                    dateFormat:'yy-mm-dd',
                    onSelect:function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
            ngModelCtrl.$parsers.push(function(val) {
                if (angular.isUndefined(val) || !(new RegExp('[1-9][0-9]{3}\-[0-9]{2}\-[0-9]{2}').test(val))) {
                    val = '';
                    ngModelCtrl.$setViewValue(val);
                    ngModelCtrl.$render();
                }
                return val;
            });
        }
    }
});


QuestioApp.directive('ngtimepicker', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function (scope, element, attrs, ngModelCtrl) {
            $(function(){
                element.timepicker({
                    timeFormat:'HH:mm',
                    onSelect:function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    },
                    onClose:function (date) {
                        ngModelCtrl.$setViewValue(date);
                        scope.$apply();
                    }
                });
            });
            ngModelCtrl.$parsers.push(function(val) {
                if (angular.isUndefined(val) || !(new RegExp('[0-9]{2}\:[0-9]{2}').test(val))) {
                    val = '';
                    ngModelCtrl.$setViewValue(val);
                    ngModelCtrl.$render();
                }
                return val;
            });
        }
    }
});

QuestioApp.directive('removeHtmlTags', function() {
    return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            if(!ngModelCtrl) {
                return;
            }

            var el = element[0];

            ngModelCtrl.$parsers.push(function(val) {
                if (angular.isUndefined(val)) {
                    var val = '';
                }
                var noHtml = val
                    .replace(/\&lt;/g, '<')
                    .replace(/\&gt;/g, '>')
                    .replace(/\&nbsp;/g, ' ')
                    .replace(/\&amp;/g, '&')
                    .replace(/\&quot;/g, '"')
                    .replace(/\&apos;/g, '')
                    .replace(/\&[a-z,A-Z,0-9,#]+;/g, '')
                    .replace(/(<\/?[a-z,A-Z]+(\s+[a-z,A-Z,\-,\_]+\=[\',\"]((.|\n)*)[\',\"])*\s*\/?>)/ig,"");

                if(noHtml != val) {
                    ngModelCtrl.$setViewValue(noHtml);
                    ngModelCtrl.$render();

                    //újrarenderelt angular mező kurzora álljon vissza a string végére
                    var range = document.createRange();
                    var sel = window.getSelection();
                    var lastNode = el.childNodes.length-1;
                    range.setStart(el.childNodes[lastNode], el.childNodes[lastNode].length);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);

                    return noHtml;
                }
                return val;
            });
        }
    };
});

QuestioApp.directive('callChildrensClick',
    function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {
                $(element).css("cursor", "pointer");
                $(element).click(function(event) {
                    event.stopPropagation();
                    $(this).find(':input').each(function(i, e) {
                        if(!(QuestioApp.Util.isEqual($(this).prop('disabled'), true))) {
                            if ($(this).attr('type') == 'radio') {
                                $(this).prop("checked", true);
                            }
                            $(this).click();
                        }
                    });
                });
            }
        };
    });
