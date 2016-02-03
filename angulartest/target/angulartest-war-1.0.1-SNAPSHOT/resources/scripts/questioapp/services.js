var services = angular.module('services', ['ngResource']);

services.factory('QuestionnaireTemplateService', ['$resource',
    function($resource){
        return $resource(_contextPath+'/rest/editorrestservice/:templateId', {}, {
            save: {
                method:'POST',
                transformRequest: function(payload, headers){
                    var ignoreList = QuestioApp.Util.getIgnoreList("questionnaireTemplate");
                    payload = QuestioApp.Util.stringify(payload, ignoreList);
                    return payload;
                }
            }
        });
    }]
);

services.factory('MultimediaTempService', ['$resource',
   function($resource){
       return $resource(_contextPath+'/rest/editorrestservice/persistedmedia/:fileName/:contentType', {}, {
           save: {
               method:'POST',
               headers: {'Content-Type': undefined},
               transformRequest: function(payload, headers){
                   return payload;
               }
           }
       });
   }]
);

services.factory('TerminationService', ['$resource',
        function($resource){
            return $resource(_contextPath+'/rest/editorrestservice/terminations', {}, {});
        }]
);

services.factory('DataTablesService', ['$resource',
    function($resource){
        return $resource(_contextPath+'/rest/editorrestservice/datatables', {}, {});
    }]
);

services.factory('TemplateListService', ['$resource',
    function($resource){
        return $resource(_contextPath+'/rest/editorrestservice/templatelist', {}, {});
    }]
);

services.factory('QuestionListService', ['$resource',
    function($resource){
        return $resource(_contextPath+'/rest/editorrestservice/questionlist/:templateId', {}, {});
    }]
);

services.factory('QuestionnaireTestService', ['$resource',
    function($resource){
        return $resource(_contextPath+'/rest/testrestservice/:templateId/:questionnaireId', {}, {
            save: {
                method:'POST',
                transformRequest: function(payload, headers){
                    var ignoreList = QuestioApp.Util.getIgnoreList("questionnaireTest");
                    payload = QuestioApp.Util.stringify(payload, ignoreList);
                    return payload;
                }
            }
        });
    }]
);

services.factory('PhoneInterviewService', ['$resource',
        function($resource){
            return $resource(_contextPath+'/rest/phoneinterviewrestservice/:templateId/:questionnaireId', {}, {
                save: {
                    method:'POST',
                    transformRequest: function(payload, headers){
                        var ignoreList = QuestioApp.Util.getIgnoreList("PhoneInterview");
                        payload = QuestioApp.Util.stringify(payload, ignoreList);
                        return payload;
                    }
                }
            });
        }]
);

services.factory('PhoneInterviewDeleteService', ['$resource',
        function($resource){
            return $resource(_contextPath+'/rest/phoneinterviewrestservice/delete', {}, {
                delete: {
                    method:'POST',
                    transformRequest: function(payload, headers){
                        var ignoreList = QuestioApp.Util.getIgnoreList("PhoneInterview");
                        payload = QuestioApp.Util.stringify(payload, ignoreList);
                        return payload;
                    }
                }
            });
        }]
);