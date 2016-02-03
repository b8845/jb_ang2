/**
 * A mátrix feladattípus szerkesztőjének segédfunkciói
 */
QuestioApp.service('MatrixFunctions', ['ConditionFunctions', 'MessageFunctions', function(ConditionFunctions, MessageFunctions) {

    /**
     * Services
     */
    this.conditionFunctions = ConditionFunctions;
    this.messageFunctions = MessageFunctions;

    /**
     * A mátrix soraival kapcsolatos funkciók
     */
    this.addRow = function(template, questionIndex, insertAt, title, otherDimension){
        var newElement = new ItemDimensionEditorDTO();
        var rows = template.questions[questionIndex].rows;
        newElement.id = QuestioApp.Util.generateId(rows);
        newElement.title = title; // != null ? title : "";
        newElement.otherDimension = otherDimension;
        if(QuestioApp.Util.isDefinedAndNotNull(insertAt)) {
            rows[insertAt].hovered = false;
            newElement.hovered = true;
            newElement.index = insertAt;
            newElement.valueID = newElement.index + 1;
            for(var i = insertAt; i < rows.length; ++i){
                ++rows[i].index;
            }
            rows.splice(insertAt,0,newElement);
        }
        else{
            newElement.index = rows.length;
            newElement.valueID = newElement.index + 1;
            rows.push(newElement);
        }
    };

    this.resetRowIndexes = function(template,questionIndex){
        $.each(template.questions[questionIndex].rows, function( index, value ) {
            value.index = index;
        });
    };

    this.resetRowValueIds = function(template,questionIndex){
        $.each(template.questions[questionIndex].rows, function( index, value ) {
            value.valueID = index + 1;
        });
    };

    this.deleteRow = function(template,questionIndex, rowIndex){
        if(this.conditionFunctions.questionDimensionHasCondition(template, template.conditions, questionIndex, rowIndex, 'row')) {
            this.messageFunctions.showSingleMessageById('deleteRowPreventedByCondition',null,'alert');
        }
        else if(this.conditionFunctions.questionDimensionHasCondition(template, template.quotas, questionIndex, rowIndex, 'row')) {
            this.messageFunctions.showSingleMessageById('deleteRowPreventedByQuota',null,'alert');
        }
        else{
            var rows=template.questions[questionIndex].rows;
            rows.splice(rowIndex, 1);
            this.resetRowIndexes(template,questionIndex);
            if(rowIndex!=rows.length) {
                rows[rowIndex].hovered = true;
            }
        }
    };

    this.moveRowUp = function(template,questionIndex, rowIndex){
        if(rowIndex != 0) {
            var rows = template.questions[questionIndex].rows;
            var row = rows[rowIndex];
            row.index = rowIndex - 1;
            row.hovered = false;
            rows[rowIndex - 1].hovered = true;
            rows[rowIndex - 1].index = rowIndex;
            rows.splice(rowIndex, 1);
            rows.splice(rowIndex-1, 0, row);
        }
    };

    this.moveRowDown = function(template,questionIndex, rowIndex){
        var rows = template.questions[questionIndex].rows;
        if(rowIndex != rows.length -1) {
            var row = rows[rowIndex];
            row.index = rowIndex + 1;
            row.hovered = false;
            rows[rowIndex + 1].hovered = true;
            rows[rowIndex + 1].index = rowIndex;
            rows.splice(rowIndex, 1);
            rows.splice(rowIndex+1, 0, row);
        }
    };

    /**
     * A mátrix oszlopaival kapcsolatos funkciók
     */
    this.addColumn = function(template,questionIndex,insertAt,title){
        var columns = template.questions[questionIndex].columns;
        var newElement = new ItemDimensionEditorDTO();
        newElement.id = QuestioApp.Util.generateId(columns);
        newElement.title = title != null ? title : "";
        if(QuestioApp.Util.isDefinedAndNotNull(insertAt)) {
            columns[insertAt].hovered = false;
            newElement.hovered = true;
            newElement.index = insertAt;
            newElement.valueID = newElement.index + 1;
            for(var i = insertAt; i < columns.length; ++i){
                ++columns[i].index;
            }
            columns.splice(insertAt,0,newElement);
        }
        else {
            newElement.index = columns.length;
            newElement.valueID = newElement.index + 1;
            columns.push(newElement);
        }
    };

    this.resetColumnIndexes = function(template,questionIndex){
        $.each(template.questions[questionIndex].columns, function( index, value ) {
            value.index = index;
        });
    };

    this.resetColumnValueIds = function(template,questionIndex){
        $.each(template.questions[questionIndex].columns, function( index, value ) {
            value.valueID = index + 1;
        });
    };

    this.deleteColumn = function(template,questionIndex,columnIndex){
        if(this.conditionFunctions.questionDimensionHasCondition(template, template.conditions, questionIndex, columnIndex, 'column')) {
            this.messageFunctions.showSingleMessageById('deleteColumnPreventedByCondition',null,'alert');
        }
        else if(this.conditionFunctions.questionDimensionHasCondition(template, template.quotas, questionIndex, columnIndex, 'column')) {
            this.messageFunctions.showSingleMessageById('deleteColumnPreventedByQuota',null,'alert');
        }
        else{
            var columns=template.questions[questionIndex].columns;
            columns.splice(columnIndex, 1);
            this.resetColumnIndexes(template,questionIndex);
            if(columnIndex!=columns.length) {
                columns[columnIndex].hovered = true;
            }
        }
    };

    this.moveColumnLeft = function(template,questionIndex,columnIndex){
        if(columnIndex != 0) {
            var columns = template.questions[questionIndex].columns;
            var column = columns[columnIndex];
            column.index = columnIndex - 1;
            column.hovered = false;
            columns[columnIndex-1].index = columnIndex;
            columns[columnIndex-1].hovered = true;
            columns.splice(columnIndex, 1);
            columns.splice(columnIndex-1, 0, column);
        }
    };

    this.moveColumnRight = function(template,questionIndex,columnIndex){
        if(columnIndex != template.questions[questionIndex].columns.length -1) {
            var columns = template.questions[questionIndex].columns;
            var column = columns[columnIndex];
            column.index = columnIndex + 1;
            column.hovered = false;
            columns[columnIndex+1].hovered = true;
            columns[columnIndex+1].index = columnIndex;
            columns.splice(columnIndex, 1);
            columns.splice(columnIndex+1, 0, column);
        }
    };

    /**
     * mátrix checkBox funkciók
     */
    this.resetCheckBoxes = function(question){
        $.each($('.matrix-editor-checkbox'), function( index, value ) {
            value.checked = false;
        });
    };

    this.toggleDimensionRotation = function(dimensions){
        if(dimensions.length != 0){
            var newRotation = !dimensions[0].rotated;
            for(var i = 0; i < dimensions.length; i++){
                dimensions[i].rotated = newRotation;
            }
        }
    }
}]);



