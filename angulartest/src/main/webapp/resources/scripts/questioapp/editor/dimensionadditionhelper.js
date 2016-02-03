/**
 * Kérdések klónozásának segédosztálya
 */

DimensionAdditionHelper = function () {

    this.dimensions = [];

    this.selectedDimension = [];

    this.additionText = "";

    this.initDimensions = function(question){
        this.selectedDimension = [];
        this.dimensions = [];
        if(question.questionType == 'SimpleChoice' ||
            question.questionType == 'Matrix' ||
            question.questionType == 'FreeText' ||
            question.questionType == 'ScrollbarQuestion' ||
            (question.questionType == 'SpecialQuestion' && question.itemType == 'RadioButtonColumn')
            ){
            this.dimensions.push({label: "Sorok", value: "rows"});
        }
        if(question.questionType == 'Matrix' ||
            question.questionType == 'FreeText'
            ){
            this.dimensions.push({label: "Oszlopok", value: "columns"});
        }
        if(question.questionType == 'OrderQuestion' ||
            question.questionType == 'SharedNumeric'){
            this.dimensions.push({label: "Értékek", value: "rows"});
        }
        else if(question.questionType == 'GroupQuestion'){
            this.dimensions.push({label: "Csoportosítandó elemek", value: "columns"});
            this.dimensions.push({label: "Csoportok", value: "rows"});
        }

        if(this.dimensions.length != 0) {
            this.selectedDimension.push(this.dimensions[0]);
            this.dimensions[0].ticked = true;
        }
    }

    this.addDimensions = function(question){
        var newElements = this.additionText.trim().match(/[^\r\n]+/g);
        if(newElements == null || this.selectedDimension.length != 1){
            return "invalidInput";
        }

        var newDimensions = [];
        var currentIndex = 0;
        if(this.selectedDimension[0].value == 'rows'){
            currentIndex = question.rows.length;
        }
        else{
            currentIndex = question.columns.length;
        }
        for(var i = 0; i < newElements.length; i++) {
            var parts = newElements[i].split('#');
            if (parts.length > 2) {
                return "invalidInput";
            }
            else if (parts.length == 1) {
                parts.splice(0, 0, (currentIndex + i + 1) + "");
            }
            else if(!(/^-?[\d.]+(?:e-?\d+)?$/.test(parts[0].trim()))){
                return "idNotNumeric";
            }
            newDimensions.push(parts);
        }

        for(var i = 0; i < newDimensions.length; i++) {
            var newElement = new ItemDimensionEditorDTO();
            newElement.index = currentIndex + i;
            newElement.valueID = newDimensions[i][0].trim();
            newElement.title = newDimensions[i][1].trim();
            if(this.selectedDimension[0].value == 'rows') {
                newElement.id = QuestioApp.Util.generateId(question.rows);
                question.rows.push(newElement);
            }
            else{
                newElement.id = QuestioApp.Util.generateId(question.columns);
                question.columns.push(newElement);
            }
        }
        return null;
    }
};

