/**
 * Kérdések klónozásának segédosztálya
 */

CloneQuestionHelper = function () {

    this.currentTemplate = null;

    this.templates = [];

    this.selectedTemplate = [];

    this.importQuestions = [];

    this.importQuestionsComplete = [];

    this.selectedImportQuestions = [];

    this.questions = [];

    this.selectedQuestion = [];

    this.reinitQuestionList = function(){
        this.importQuestions = [];
        this.selectedImportQuestions = [];
        this.importQuestionsComplete = [];
    }

    this.initTemplates = function(template, templateList) {
        this.currentTemplate = template;
        if(QuestioApp.Util.isDefinedAndNotNull(templateList) && QuestioApp.Util.isInitialized(templateList.templates)){
            for(var i = 0; i < templateList.templates.length; i++) {
                if(!QuestioApp.Util.isEqual(this.currentTemplate.questionnaireTemplate.id, templateList.templates[i].id)) {
                    this.templates.push({
                        id: templateList.templates[i].id,
                        name: templateList.templates[i].name,
                        ticked: false
                    });
                }
            }
        }
    };

    this.initImportQuestions = function(questionList){
        this.reinitQuestionList();
        if(QuestioApp.Util.isDefinedAndNotNull(questionList) && QuestioApp.Util.isInitialized(questionList.questions)){
            this.importQuestionsComplete = questionList.questions;
            for(var i = 0; i < questionList.questions.length; i++) {
                this.importQuestions.push({
                    id: questionList.questions[i].id,
                    letter: questionList.questions[i].letter,
                    localizedType: QuestioApp.Util.getHungarianQuestionType(questionList.questions[i].questionType),
                    ticked: false
                });
            }
        }
    }

    this.initQuestions = function(template){
        this.questions = [];
        for(var i = 0; i < template.questions.length; i++){
            if(template.questions[i].questionType != null &&
                template.questions[i].questionType != 'Új kérdés"') {
                var questionVM = {
                    id: template.questions[i].id,
                    index: template.questions[i].index,
                    letter: template.questions[i].letter,
                    localizedType: template.questions[i].localizedType,
                    ticked: false
                };
                this.questions.push(questionVM);
            }
        }
    }

    this.cloneSelectedQuestion = function(template, question, letter){
        if(question.cloneQuestionHelper.selectedQuestion.length == 1){
            var cloned = template.questions[question.cloneQuestionHelper.selectedQuestion[0].index];
            var newQuestion = {};
            angular.copy(cloned, newQuestion);
            newQuestion.id = QuestioApp.Util.generateId(template.questions);
            newQuestion.index = question.index;
            newQuestion.viewHelper = new QuestionViewHelper();
            newQuestion.viewHelper.itemTypes = cloned.viewHelper.itemTypes;
            newQuestion.viewHelper.openedForEdit = true;
            newQuestion.letter = letter;
            // TODO ezt megcsinálni rendesen + fejlesztési idő, el kell dönteni majd, hogy kell-e
            newQuestion.multimedias = [];
            template.questions.splice(question.index, 1, newQuestion);
            initTimeTools();
        }
    }

    this.importSelectedQuestions = function(template, question, initDataTables, questionFunctions){
        if(QuestioApp.Util.isInitialized(this.selectedImportQuestions)){
            var id = QuestioApp.Util.generateId(template.questions);
            var startIndex = question.index;
            for(var i = 0; i < this.selectedImportQuestions.length; i++){
                for(var j = 0; j < this.importQuestionsComplete.length; j++){
                    if(QuestioApp.Util.isEqual(this.selectedImportQuestions[i].id, this.importQuestionsComplete[j].id)){
                        var newQuestion = this.importQuestionsComplete[j];
                        newQuestion.id = id + i;
                        newQuestion.viewHelper = new QuestionViewHelper();
                        newQuestion.viewHelper.openedForEdit = i == 0;
                        newQuestion.viewHelper.imported = true;
                        newQuestion.viewHelper.itemTypes = questionFunctions.getItemTypesForQuestion(newQuestion.questionType);
                        newQuestion.localizedType = questionFunctions.getHungarianQuestionType(newQuestion.questionType);
                        // TODO ezt megcsinálni rendesen + fejlesztési idő, el kell dönteni majd, hogy kell-e
                        newQuestion.multimedias = [];
                        if(newQuestion.viewHelper.openedForEdit && newQuestion.questionType == 'SpecialQuestion'){
                            initDataTables();
                        }
                        if(i == 0){
                            template.questions.splice(startIndex, 1, newQuestion);
                        }
                        else{
                            template.questions.splice(startIndex + i, 0, newQuestion);
                        }
                        break;
                    }
                }
            }
            QuestioApp.Util.reInitIndexes(template.questions);
            initTimeTools();
        }
    }
};

