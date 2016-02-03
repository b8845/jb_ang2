/**
 * A feltételek szerkesztőjének segédfunkciói
 *
 * A kvóták is ide tartoznak, amik gyakorlatilag lebutított feltételek
 */
QuestioApp.service('ConditionFunctions', function() {

    this.hoveredConditionPart = -1;

    this.hoveredConditionTarget = -1;

    this.hoveredCondition = -1;

    this.editedConditionItem = -1;

    this.editedConditionTarget = -1;

    this.hoveredQuota = -1;

    this.conditionTargetGenerator = new ConditionTargetGenerator();

    this.conditionTargetGeneratorSelector = 'conditionTargetGenerator';

    this.showOrOperator = function (parentType, parentIndex, index) {
        return (parentType == 'AndGroup' && parentIndex != 0 && index == 0) || (parentType != 'AndGroup' && index != 0);
    };

    this.showAndOperator = function (parentType, index) {
        return parentType == 'AndGroup' && index != 0;
    };

    this.updateIndexesInPart = function (part) {
        if (part.parts.length != 0) {
            $.each(part.parts, function (index, value) {
                value.index = index;
            });
        }
    };

    this.getGreatestIdOfPart = function(part, that){
        var id = 0;
        if(part.type == 'Item' || part.type == 'Bracket' || part.type == 'AndGroup'){
            id = part.id;
        }
        if(part.parts.length != 0){
            $.each(part.parts, function (index, value) {
                var currentId = that.getGreatestIdOfPart(value, that);
                if(currentId > id){
                    id = currentId;
                }
            });
        }
        return id;
    };

    this.deleteCondition = function (template, condition){
        this.hoveredCondition = -1;
        var conditions = template.conditions;
        conditions.splice(condition.index, 1);
        if (conditions.length != 0) {
            $.each(conditions, function (index, value) {
                value.index = index;
            });
        }
    };

    this.deleteConditionPart = function (part, parent, grandParent, condition){
        this.hoveredConditionPart = -1;
        if(typeof grandParent == 'undefined'){
            grandParent = condition;
        }
        parent.parts.splice(part.index, 1);
        this.updateIndexesInPart(parent);
        if (parent.type == 'AndGroup'){
            if(parent.parts.length == 0) {
                grandParent.parts.splice(parent.index, 1);
                this.updateIndexesInPart(grandParent);
            }
            else if(parent.parts.length == 1) {
                var splicedPart = parent.parts[0];
                splicedPart.index = parent.index;
                grandParent.parts.splice(parent.index, 1, splicedPart);
                this.updateIndexesInPart(grandParent);
            }
        }
    };

    this.addNewCondition = function(template, conditionType){
        var newCondition = new ConditionEditorDTO();
        newCondition.id = QuestioApp.Util.generateId(template.conditions);
        newCondition.index = template.conditions.length;
        newCondition.type = conditionType;
        template.conditions.push(newCondition);
    };

    this.addNewPart = function(part, parent, grandParent, condition, addInsideParent, addAndOperator, type){
        this.hoveredConditionPart = -1;
        if(typeof grandParent == 'undefined'){
            grandParent = condition;
        }

        var newPart = null;
        if(type == 'Item'){
            var newPart = new ConditionItemEditorDTO();
        }
        else{
            var newPart = new ConditionPartEditorDTO();
        }
        newPart.id = this.getGreatestIdOfPart(condition, this) + 1;
        newPart.type = type;

        if(part == null){
            newPart.index = 0;
            condition.parts.push(newPart);
            return;
        }

        if(addInsideParent){
            part.parts.splice(0, 0, newPart);
            this.updateIndexesInPart(part);
        }
        else if(!addAndOperator){
            if(parent.type != 'AndGroup'){
                // zárójeles kifejezésbe kerül, egyszerűen csak be kell illeszteni
                parent.parts.splice(part.index + 1, 0, newPart);
                this.updateIndexesInPart(parent);
            }
            else if(parent.type == 'AndGroup'){
                // és csoport után kerül csak az elem vagy kapcsolattal
                if(part.index == parent.parts.length -1){
                    grandParent.parts.splice(parent.index + 1, 0, newPart);
                    this.updateIndexesInPart(grandParent);
                    return;
                }
                // és csoport első helyére kerül, az eddigi első elem leszakad, de nem lesz tagja és csoportnak
                else if(part.index == 0){
                    var firstElement = part;
                    parent.parts.splice(0, 1, newPart);
                    this.updateIndexesInPart(parent);
                    grandParent.parts.splice(parent.index, 0, firstElement);
                    this.updateIndexesInPart(grandParent);
                }
                // és csoport közepére kerül az elem, így az és csoport két és csoportra szakad
                else{
                    var partIndex = part.index;
                    var newAndGroup = new ConditionPartEditorDTO();
                    newAndGroup.id = newPart.id + 1;
                    newAndGroup.type = 'AndGroup';
                    for(i = 0; i <= part.index; i++){
                        newAndGroup.parts.splice(i, 0, parent.parts[i]);
                    }
                    parent.parts.splice(0, partIndex + 1, newPart);
                    this.updateIndexesInPart(parent);
                    this.updateIndexesInPart(newAndGroup);
                    grandParent.parts.splice(parent.index, 0, newAndGroup);
                    this.updateIndexesInPart(grandParent);
                }
            }
        }
        else if(addAndOperator){
            if(parent.type == 'AndGroup'){
                parent.parts.splice(part.index + 1, 0, newPart);
                this.updateIndexesInPart(parent);
            }
            else{
                var partIndex = part.index;
                var newAndGroup = new ConditionPartEditorDTO();
                newAndGroup.id = newPart.id + 1;
                newAndGroup.type = 'AndGroup';
                newAndGroup.index = partIndex;
                newAndGroup.parts.splice(0, 0, part);
                newAndGroup.parts.splice(1, 0, newPart);
                this.updateIndexesInPart(newAndGroup);
                parent.parts.splice(partIndex, 1, newAndGroup);
            }
        }
    };

    this.changeOperator = function(part, parent, grandParent, condition){
        this.hoveredConditionPart = -1;
        if(typeof grandParent == 'undefined'){
            grandParent = condition;
        }
        if(parent.type == 'AndGroup'){
            if(part.index == 0){
                // Előtte lévő elem beemelése az AndGroup első helyére
                if(grandParent.parts[parent.index-1].type != 'AndGroup'){
                    var splicedPart = grandParent.parts[parent.index-1];
                    grandParent.parts.splice(parent.index-1, 1);
                    this.updateIndexesInPart(grandParent);
                    parent.parts.splice(0, 0, splicedPart);
                    this.updateIndexesInPart(parent);
                }
                // két AndGroup-ot kell összekötni
                else{
                    for(i = 0; i < parent.parts.length; i++){
                        grandParent.parts[parent.index-1].parts.push(parent.parts[i]);
                    }
                    this.updateIndexesInPart(grandParent.parts[parent.index-1]);
                    grandParent.parts.splice(parent.index, 1);
                    this.updateIndexesInPart(grandParent);
                }
            }
            // első elemet le kell csatolni az AndGroup-ból
            else if(part.index == 1){
                var spliced = parent.parts[0];
                parent.parts.splice(0, 1);
                this.updateIndexesInPart(parent);
                grandParent.parts.splice(parent.index, 0, spliced);
                this.updateIndexesInPart(grandParent);
            }
            // utolsó elem az AndGroup-ban, le kell csatolni
            else if(part.index == parent.parts.length -1){
                parent.parts.splice(parent.parts.length -1, 1);
                grandParent.parts.splice(parent.index + 1, 0, part);
                this.updateIndexesInPart(grandParent);
            }
            // AndGroup közepén vagyunk, szét kell csatolni 2 csoporttá
            else{
                var index = part.index;
                var newAndGroup = new ConditionPartEditorDTO();
                newAndGroup.id = this.getGreatestIdOfPart(condition, this) + 1;
                newAndGroup.type = 'AndGroup';
                for(i = index; i < parent.parts.length; i++){
                    newAndGroup.parts.push(parent.parts[i]);
                }
                this.updateIndexesInPart(newAndGroup);
                parent.parts.splice(index, parent.parts.length - index);
                grandParent.parts.splice(parent.index + 1, 0, newAndGroup);
                this.updateIndexesInPart(grandParent);
            }
        }
        else{
            // 2 szomszédos elem összevonása AndGroup-pá
            if(parent.parts[part.index-1].type != 'AndGroup'){
                var newAndGroup = new ConditionPartEditorDTO();
                newAndGroup.id = this.getGreatestIdOfPart(condition, this) + 1;
                newAndGroup.type = 'AndGroup';
                newAndGroup.parts.push(parent.parts[part.index-1]);
                newAndGroup.parts.push(part);
                this.updateIndexesInPart(newAndGroup);
                parent.parts.splice(part.index - 1, 2, newAndGroup);
                this.updateIndexesInPart(parent);
            }
            else{
                var index = part.index;
                parent.parts.splice(index, 1);
                part.index = parent.parts[index-1].parts.length;
                parent.parts[index-1].parts.push(part);
                this.updateIndexesInPart(parent);
            }
        }
    };

    this.conditionViewChanged = function(template){
        $.each(template.conditions, function (index, value) {
            value.viewOpened = false;
        });
        $.each(template.quotas, function (index, value) {
            value.viewOpened = false;
        });
        this.editedConditionItem = -1;

        this.editedConditionTarget = -1;
    };

    this.openConditionForEdit = function(template, condition){
        if(!condition.viewOpened){
            this.editedConditionItem = -1;
            this.editedConditionTarget = -1;
        }
        $.each(template.conditions, function (index, value) {
            value.viewOpened = value.id == condition.id;
        });
    };

    this.openItemForEdit = function(template, item, condition){
        this.editedConditionItem = item.id;
//        this.editedConditionTarget = -1;
        item.itemHelper = new ConditionItemHelper();
        item.itemHelper.itemOrTarget = 'Item';
        item.itemHelper.conditionType = condition.type;
        item.itemHelper.initQuestions(template, item);
    };

    this.openTargetForEdit = function(template, target, condition){
        this.editedConditionTarget = target.id;
//        this.editedConditionItem = -1;
        target.itemHelper = new ConditionItemHelper();
        target.itemHelper.itemOrTarget = 'Target';
        target.itemHelper.conditionType = condition.type;
        target.itemHelper.initQuestions(template, target);
    };

    this.addConditionTarget = function(condition){
        var newTarget = new ConditionTargetEditorDTO();
        newTarget.id =  QuestioApp.Util.generateId(condition.targets);
        newTarget.index = condition.targets.length;
        condition.targets.push(newTarget);
    };

    this.openConditionTargetGenerator = function(template){
        this.conditionTargetGenerator.initForTemplate(template);
        this.editedConditionTarget = this.conditionTargetGeneratorSelector;
    };

    this.generateConditionTargets = function(condition){
        if(this.conditionTargetGenerator.generateConditionTargets(condition)){
            this.editedConditionTarget = -1;
        }
    }

    this.deleteConditionTarget = function(target, condition){
        condition.targets.splice(target.index,1);
        $.each(condition.targets, function (index, value) {
            value.index = index;
        });
    };

    this.initConditionPartForView = function(part, that, template){
        if(part.type == 'Item'){
            if(QuestioApp.Util.isInitialized(part.conditionValueType)){
                var conditionValueType = [];
                conditionValueType.push({value: part.conditionValueType});
                part.conditionValueType = conditionValueType;
            }
            if(QuestioApp.Util.isInitialized(part.constructSource)){
                var constructSource = [];
                constructSource.push({value: part.constructSource});
                part.constructSource = constructSource;
            }
            if(QuestioApp.Util.isInitialized(part.questionId)){
                var questionId = [];
                var letter = '';
                var localizedType = '';
                if(QuestioApp.Util.isInitialized(template.questions)){
                    for(var i = 0; i < template.questions.length; i++){
                        if(template.questions[i].id == part.questionId){
                            letter = template.questions[i].letter;
                            localizedType = template.questions[i].localizedType;
                        }
                    }
                }
                questionId.push({id: part.questionId, letter: letter, localizedType: localizedType});
                part.questionId = questionId;
            }
            else{
                part.questionId = [];
            }
            if(QuestioApp.Util.isInitialized(part.rowIds)){
                var rowIds = [];
                for(var i = 0; i < part.rowIds.length; i++){
                    rowIds.push({id: part.rowIds[i]});
                }
                part.rowIds = rowIds;
            }
            if(QuestioApp.Util.isInitialized(part.columnIds)){
                var columnIds = [];
                for(var i = 0; i < part.columnIds.length; i++){
                    columnIds.push({id: part.columnIds[i]});
                }
                part.columnIds = columnIds;
            }
        }
        else if(part.parts.length != 0){
            $.each(part.parts, function (index, value) {
                that.initConditionPartForView(value, that, template);
            });
        }
    };

    this.initConditionTargetForView = function(target, template){
        if(QuestioApp.Util.isInitialized(target.type)){
            var type = [];
            type.push({value: target.type});
            target.type = type;
        }
        if(QuestioApp.Util.isInitialized(target.questionId)){
            var questionId = [];
            var letter = '';
            var localizedType = '';
            if(QuestioApp.Util.isInitialized(template.questions)){
                for(var i = 0; i < template.questions.length; i++){
                    if(template.questions[i].id == target.questionId){
                        letter = template.questions[i].letter;
                        localizedType = template.questions[i].localizedType;
                    }
                }
            }
            questionId.push({id: target.questionId, letter: letter, localizedType: localizedType});
            target.questionId = questionId;
        }
        else{
            target.questionId = [];
        }
        if(QuestioApp.Util.isInitialized(target.rowIds)){
            var rowIds = [];
            for(var i = 0; i < target.rowIds.length; i++){
                rowIds.push({id: target.rowIds[i]});
            }
            target.rowIds = rowIds;
        }
        if(QuestioApp.Util.isInitialized(target.columnIds)){
            var columnIds = [];
            for(var i = 0; i < target.columnIds.length; i++){
                columnIds.push({id: target.columnIds[i]});
            }
            target.columnIds = columnIds;
        }
    };

    this.initTemplateForView = function(data){
        var conditionFunctions = this;
        if (QuestioApp.Util.isInitialized(data.conditions)) {
            $.each(data.conditions, function (index, value) {
                if(QuestioApp.Util.isInitialized(value.parts)){
                    for(var i = 0; i < value.parts.length; i++){
                        conditionFunctions.initConditionPartForView(value.parts[i], conditionFunctions, data)
                    }
                }
                if(QuestioApp.Util.isInitialized(value.targets)){
                    for(var i = 0; i < value.targets.length; i++){
                        conditionFunctions.initConditionTargetForView(value.targets[i], data)
                    }
                }
            });
        }
        if (QuestioApp.Util.isInitialized(data.quotas)) {
            $.each(data.quotas, function (index, value) {
                if(QuestioApp.Util.isInitialized(value.parts)){
                    for(var i = 0; i < value.parts.length; i++){
                        conditionFunctions.initConditionPartForView(value.parts[i], conditionFunctions, data)
                    }
                }
            });
        }
        return data;
    };

    this.initConditionPartForSave = function(part, that){
        if(part.type == 'Item'){
            part.entitytype = "questio.entity.questionnairetemplate.ConditionItem";
        }
        else{
            part.entitytype = "questio.entity.questionnairetemplate.ConditionPart";
        }
        if(part.type == 'Item'){
            if(QuestioApp.Util.isInitialized(part.conditionValueType)){
                part.conditionValueType = part.conditionValueType[0].value;
            }
            else{
                part.conditionValueType = null;
            }
            if(QuestioApp.Util.isInitialized(part.constructSource)){
                part.constructSource = part.constructSource[0].value;
            }
            else{
                part.constructSource = null;
            }
            if(QuestioApp.Util.isInitialized(part.questionId)){
                part.questionId = part.questionId[0].id;
            }
            else{
                part.questionId = null;
            }
            if(QuestioApp.Util.isInitialized(part.rowIds)){
                var rowIds = [];
                for(var i = 0; i < part.rowIds.length; i++){
                    rowIds.push(part.rowIds[i].id);
                }
                part.rowIds = rowIds;
            }
            if(QuestioApp.Util.isInitialized(part.columnIds)){
                var columnIds = [];
                for(var i = 0; i < part.columnIds.length; i++){
                    columnIds.push(part.columnIds[i].id);
                }
                part.columnIds = columnIds;
            }
        }
        else if(part.parts.length != 0){
            $.each(part.parts, function (index, value) {
                that.initConditionPartForSave(value, that);
            });
        }
    };

    this.initConditionTargetForSave = function(target){
        if(QuestioApp.Util.isInitialized(target.type)){
            target.type = target.type[0].value;
        }
        else{
            target.type = null;
        }
        if(QuestioApp.Util.isInitialized(target.questionId)){
            target.questionId = target.questionId[0].id;
        }
        else{
            target.questionId = null;
        }
        if(QuestioApp.Util.isInitialized(target.rowIds)){
            var rowIds = [];
            for(var i = 0; i < target.rowIds.length; i++){
                rowIds.push(target.rowIds[i].id);
            }
            target.rowIds = rowIds;
        }
        if(QuestioApp.Util.isInitialized(target.columnIds)){
            var columnIds = [];
            for(var i = 0; i < target.columnIds.length; i++){
                columnIds.push(target.columnIds[i].id);
            }
            target.columnIds = columnIds;
        }
    };

    this.initTemplateForSave = function(data){
        var conditionFunctions = this;
        if (QuestioApp.Util.isInitialized(data.conditions)) {
            $.each(data.conditions, function (index, value) {
                if(QuestioApp.Util.isInitialized(value.parts)){
                    for(var i = 0; i < value.parts.length; i++){
                        conditionFunctions.initConditionPartForSave(value.parts[i], conditionFunctions)
                    }
                }
                if(QuestioApp.Util.isInitialized(value.targets)){
                    for(var i = 0; i < value.targets.length; i++){
                        conditionFunctions.initConditionTargetForSave(value.targets[i])
                    }
                }
            });
        }
        if (QuestioApp.Util.isInitialized(data.quotas)) {
            $.each(data.quotas, function (index, value) {
                if(QuestioApp.Util.isInitialized(value.parts)){
                    for(var i = 0; i < value.parts.length; i++){
                        conditionFunctions.initConditionPartForSave(value.parts[i], conditionFunctions)
                    }
                }
            });
        }
        return data;
    };

    this.getItemIfHasConditionForDimension = function(part, rowOrColumn, questionId, dimensionId, that){
        if(part.type == 'Item' && QuestioApp.Util.isInitialized(part.questionId) && part.questionId[0].id == questionId){
            if(rowOrColumn == 'row' && part.rowIds.length != 0){
                for(var i = 0; i < part.rowIds.length; i++){
                    if(part.rowIds[i].id == dimensionId){
                        return part;
                    }
                }
            }
            else if(rowOrColumn == 'column' && part.columnIds.length != 0){
                for(var i = 0; i < part.columnIds.length; i++){
                    if(part.columnIds[i].id == dimensionId){
                        return part;
                    }
                }
            }
        }
        else if(part.parts.length != 0){
            var childId = null;
            for(var i = 0; i < part.parts.length; i++){
                child = that.getItemIfHasConditionForDimension(part.parts[i], rowOrColumn, questionId, dimensionId, that);
                if(child != null){
                    return child;
                }
            }
        }
        return null;
    };

    this.openConditionEditor = function(template, question, conditionOrQuota, item, target){
        if(!QuestioApp.Util.isDefinedAndNotNull(conditionOrQuota.type)){
            question.viewHelper.toggleSettingsPanel('quota');
        }
        else {
            if (conditionOrQuota.type == 'Jump') {
                question.viewHelper.toggleSettingsPanel('jump_condition');
            }
            else if (conditionOrQuota.type == 'Visibility') {
                question.viewHelper.toggleSettingsPanel('visibility_condition');
            }
            else if (conditionOrQuota.type == 'Construct') {
                question.viewHelper.toggleSettingsPanel('construct_condition');
            }
        }

        conditionOrQuota.viewOpened = true;
        if(item != null){
            this.openItemForEdit(template, item, conditionOrQuota);
        }
        if(target != null){
            this.openTargetForEdit(template, target, conditionOrQuota);
        }
    };

    this.questionDimensionHasCondition = function(template, conditions, questionIndex, dimensionIndex, rowOrColumn){
        if (QuestioApp.Util.isInitialized(conditions)) {
            var that = this;
            var questionId = template.questions[questionIndex].id;
            var dimensionId = rowOrColumn == 'row' ? template.questions[questionIndex].rows[dimensionIndex].id : template.questions[questionIndex].columns[dimensionIndex].id;

            for(var i = 0; i < conditions.length; i++){
                if(QuestioApp.Util.isInitialized(conditions[i].parts)){
                    var item = null;
                    for(var j = 0; j < conditions[i].parts.length; j++){
                        item = that.getItemIfHasConditionForDimension(conditions[i].parts[j], rowOrColumn, questionId, dimensionId, that);
                        if(item != null){
                            that.openConditionEditor(template, template.questions[questionIndex], conditions[i], item, null);
                            return true;
                        }
                    }
                }
                if(QuestioApp.Util.isInitialized(conditions[i].targets)){
                    for(var j = 0; j < conditions[i].targets.length; j++){
                        var target = conditions[i].targets[j];
                        if(QuestioApp.Util.isInitialized(target.questionId) && target.questionId[0].id == questionId){
                            if(rowOrColumn == 'row' && QuestioApp.Util.isDefinedAndNotNull(target.rowIds) && target.rowIds.length != 0){
                                for(var k = 0; k < target.rowIds.length; k++){
                                    if(target.rowIds[k].id == dimensionId){
                                        that.openConditionEditor(template, template.questions[questionIndex], conditions[i], null, target);
                                        return true;
                                    }
                                }
                            }
                            else if(rowOrColumn == 'column' && QuestioApp.Util.isDefinedAndNotNull(target.columnIds) && target.columnIds.length != 0){
                                for(var k = 0; k < target.columnIds.length; k++){
                                    if(target.columnIds[k].id == dimensionId){
                                        that.openConditionEditor(template, template.questions[questionIndex], conditions[i], null, target);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    };

    this.getItemIfHasConditionForQuestion = function(part, questionId, that){
        if(part.type == 'Item' && QuestioApp.Util.isInitialized(part.questionId) && part.questionId[0].id == questionId){
            return part;
        }
        else if(part.parts.length != 0){
            var child = null;
            for(var i = 0; i < part.parts.length; i++){
                child = that.getItemIfHasConditionForQuestion(part.parts[i], questionId, that);
                if(child != null){
                    return child;
                }
            }
        }
        return null;
    };

    this.questionHasConditionOrQuota = function(template, hoveredQuestionIndex, activeQuestionIndex, thisIsConditionValidation){
        var conditionOrQuota = thisIsConditionValidation ? template.conditions : template.quotas;
        if (QuestioApp.Util.isInitialized(conditionOrQuota)) {
            var that = this;
            var questions = template.questions;
            var questionId = questions[hoveredQuestionIndex].id;
            for(var i = 0; i < conditionOrQuota.length; i++){
                if(QuestioApp.Util.isInitialized(conditionOrQuota[i].parts)){
                    var item = null;
                    for(var j = 0; j < conditionOrQuota[i].parts.length; j++){
                        item = that.getItemIfHasConditionForQuestion(conditionOrQuota[i].parts[j], questionId, that);
                        if(item != null){
                            if(activeQuestionIndex != hoveredQuestionIndex){
                                questions[activeQuestionIndex].viewHelper.openedForEdit = false;
                                questions[activeQuestionIndex].viewHelper.settingsPanelOpened = false;
                                questions[hoveredQuestionIndex].viewHelper.openedForEdit = true;
                            }
                            for(var k = 0; k < conditionOrQuota.length; ++k){
                                conditionOrQuota[k].viewOpened = false;
                            }
                            that.openConditionEditor(template, questions[hoveredQuestionIndex], conditionOrQuota[i], item, null);
                            return true;
                        }
                    }
                }
                if(QuestioApp.Util.isInitialized(conditionOrQuota[i].targets)){
                    for(var j = 0; j < conditionOrQuota[i].targets.length; j++){
                        var target = conditionOrQuota[i].targets[j];
                        if(QuestioApp.Util.isInitialized(target.questionId) && target.questionId[0].id == questionId){
                            if(activeQuestionIndex != hoveredQuestionIndex){
                                questions[activeQuestionIndex].viewHelper.openedForEdit = false;
                                questions[activeQuestionIndex].viewHelper.settingsPanelOpened = false;
                                questions[hoveredQuestionIndex].viewHelper.openedForEdit = true;
                            }
                            for(var k = 0; k < conditionOrQuota.length; ++k){
                                conditionOrQuota[k].viewOpened = false;
                            }
                            that.openConditionEditor(template, questions[hoveredQuestionIndex], conditionOrQuota[i], null, target);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    this.openQuotaForEdit = function(template, quota){
        if(!quota.viewOpened){
            this.editedConditionItem = -1;
        }
        $.each(template.quotas, function (index, value) {
            value.viewOpened = value.id == quota.id;
        });
    };

    this.deleteQuota = function (template, quota){
        this.hoveredQuota = -1;
        template.quotas.splice(quota.index, 1);
        if (template.quotas.length != 0) {
            $.each(template.quotas, function (index, value) {
                value.index = index;
            });
        }
    };

    this.addNewQuota = function(template){
        var newQuota = new QuotaEditorDTO();
        newQuota.id = QuestioApp.Util.generateId(template.quotas);
        newQuota.index = template.quotas.length;
        newQuota.quotaEditorHelper = new QuotaEditorHelper();
        newQuota.quotaEditorHelper.initQuotaTypeHelper(newQuota);
        template.quotas.push(newQuota);
    };

    this.conditionDeleteButtonHoverOut = function(templateHelper,event){
        if(templateHelper.conditionDeleteButtonHoverOut(event)){
            this.hoveredCondition = -1;
        }
    };

    this.conditionItemHoverIn = function(conditionid,templateHelper){
        if(templateHelper.conditionItemHoverIn(conditionid)){
            this.hoveredCondition = conditionid;
        }
    };

    this.deleteConditionItem = function (template, templateHelper){
        var i;
        var conditions = template.conditions;
        for(i = 0; i < conditions.length && conditions[i].id != templateHelper.hoveredConditionID; ++i);
        if(i < conditions.length) {
            var condition = conditions[i];
            $('#condition-item-'+templateHelper.hoveredConditionID).removeClass("sentinel-bordered-hovered")
                .addClass("sentinel-bordered-nohover");
            templateHelper.hideConditionDeleteButton();
            this.deleteCondition(template,condition);
        }
    };

    this.quotaDeleteButtonHoverOut = function(templateHelper,event){
        if(templateHelper.quotaDeleteButtonHoverOut(event)){
            this.hoveredQuota = -1;
        }
    };

    this.quotaItemHoverIn = function(quotaid,templateHelper){
        if(templateHelper.quotaItemHoverIn(quotaid)){
            this.hoveredQuota = quotaid;
        }
    };

    this.deleteQuotaItem = function (template, templateHelper){
        var i;
        var quotas = template.quotas;
        for(i = 0; i < quotas.length && quotas[i].id != templateHelper.hoveredQuotaID; ++i);
        if(i < quotas.length) {
            var quota = quotas[i];
            $('#quota-item-'+templateHelper.hoveredQuotaID).removeClass("sentinel-bordered-hovered")
                .addClass("sentinel-bordered-nohover");
            templateHelper.hideQuotaDeleteButton();
            this.deleteQuota(template,quota);
        }
    };

    this.conditionPartsFound = function(part, operationOnPart, aux, conditionFunction){
        if(part.type == 'AndGroup' || part.type == 'Bracket'){
            if(QuestioApp.Util.isInitialized(part.parts)){
                for(var i = 0; i < part.parts.length; i++){
                    if(conditionFunction.conditionPartsFound(part.parts[i], operationOnPart, aux, conditionFunction)){
                        return true;
                    }
                }
            }
            return false;
        }
        else if(part.type == 'Item'){
            return operationOnPart(part, aux);
        }
        return false;
    };

    this.conditionPartIsFiltered = function(part, filter){
        if (QuestioApp.Util.isDefinedAndNotNull(part.questionId)) {
            var questionId = part.questionId;
            for(var i = 0; i < questionId.length; ++i) {
                var question = questionId[i];
                if (QuestioApp.Util.isDefinedAndNotNull(question.letter) &&
                    question.letter.toLowerCase().indexOf(filter) > -1) {
                    return true;
                }
                if (QuestioApp.Util.isDefinedAndNotNull(question.localizedType) &&
                    question.localizedType.toLowerCase().indexOf(filter) > -1) {
                    return true;
                }
            }
        }
        return false;
    };
});