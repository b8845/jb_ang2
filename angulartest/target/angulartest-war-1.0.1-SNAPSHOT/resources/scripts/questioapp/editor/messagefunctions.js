/**
 *   Felhasználónak szóló üzenetek kezelése
 */
QuestioApp.service('MessageFunctions', function() {

    this.alertMessages = [];

    this.infoMessages = [];

    this.successMessages = [];

    this.serverResponseMessages = [];

    this.showDialog = false;

    this.showServerResponseMessages = false;

    this.clearMessages = function(){
        this.alertMessages = [];
        this.infoMessages = [];
        this.successMessages = [];
    }
    this.clearServerResponseMessages = function(){
        this.serverResponseMessages = [];
    }
    this.showSingleMessageById = function(messageId, header, type){
        this.clearMessages();
        if(type == 'alert'){
            this.alertMessages.push(this.getMessageBodyFromId(messageId));
        }
        else if(type == 'info'){
            this.infoMessages.push(this.getMessageBodyFromId(messageId));
        }
        else if(type == 'success'){
            this.successMessages.push(this.getMessageBodyFromId(messageId));
        }
        this.showDialog = true;
    };

    this.showCustomMessageByType = function(message, header, type){
        this.clearMessages();
        if(type == 'alert'){
            this.alertMessages.push(message);
        }
        else if(type == 'info'){
            this.infoMessages.push(message);
        }
        else if(type == 'success'){
            this.successMessages.push(message);
        }
        this.showDialog = true;
    };

    this.showServerValidationMessages = function(messages){
        this.clearServerResponseMessages();
        for(var i = 0; i < messages.length; i++){
            this.serverResponseMessages.push(messages[i]);
        }
        this.showServerResponseMessages = true;
    };

    this.toggleSaveScreen = function(show){
        if(show){
            $('.editor-save-layer').removeClass('hidden');
            $('.editor-title-line-loadingtext').removeClass('hidden');
            $("#questionnaire-template-save-button").addClass("saveprocessactive");
        }
        else{
            $('.editor-save-layer').addClass('hidden');
            $('.editor-title-line-loadingtext').addClass('hidden');
        }
    }

    this.toggleLoadScreen = function(show){
        if(show){
            $('.editor-loading-layer').removeClass('hidden');
        }
        else{
            $('.editor-loading-layer').addClass('hidden');
        }
    }

    this.showSaveSuccess = function(templateHelper){
        $('.editor-title-line-successtext').fadeIn(0).fadeOut(4000, function(){
            if(QuestioApp.Util.isDefinedAndNotNull(templateHelper)) {
                templateHelper.saveProcessActive = false;
            }
            $("#questionnaire-template-save-button").removeClass("saveprocessactive");
        });
    }

    this.showSaveFailed = function(templateHelper){
        $('.editor-title-line-failedtext').fadeIn(0).fadeOut(4000, function(){
            if(QuestioApp.Util.isDefinedAndNotNull(templateHelper)) {
                templateHelper.saveProcessActive = false;
            }
            $("#questionnaire-template-save-button").removeClass("saveprocessactive");
        });
    }

    this.getMessageBodyFromId = function(messageId){
        if(messageId == 'deleteRowPreventedByCondition'){
            return 'A válaszott sor törlése nem lehetséges, mert az alábbi feltételcsoport része!';
        }
        if(messageId == 'deleteRowPreventedByQuota'){
            return 'A válaszott sor törlése nem lehetséges, mert az alábbi kvóta része!';
        }
        else if(messageId == 'deleteColumnPreventedByCondition'){
            return 'Az válaszott oszlop törlése nem lehetséges, mert az alábbi feltételcsoport része!';
        }
        if(messageId == 'deleteColumnPreventedByQuota'){
            return 'A válaszott oszlop törlése nem lehetséges, mert az alábbi kvóta része!';
        }
        else if(messageId == 'deleteQuestionPreventedByCondition'){
            return 'Az válaszott kérdés törlése nem lehetséges, mert az alábbi feltételcsoport része!';
        }
        else if(messageId == 'deleteQuestionPreventedByQuota'){
            return 'Az válaszott kérdés törlése nem lehetséges, mert az alábbi kvóta része!';
        }
        else if(messageId == 'noUploadFileFound'){
            return 'Nincs fájl kiválasztva!';
        }
        else if(messageId == 'wrongFileFormat'){
            return 'Csak .mp4, .mp3, .jpg, .png típusú fájlokat lehet feltölteni!';
        }
        else if(messageId == 'mediaUploadSuccessful'){
            return 'Fájlfeltöltés sikeres!';
        }
        else if(messageId == 'mediaUploadError'){
            return 'Fájlfeltöltés sikertelen!';
        }
        else if(messageId == 'invalidInput'){
            return 'Érvénytelen bemenet!';
        }
        else if(messageId == 'idNotNumeric'){
            return 'Csak számokat használhat azonosítónak!';
        }
        else if(messageId == 'terminationRequired'){
            return 'Termináció választása kötelező!';
        }
        else if(messageId == 'dataTablesNotFound'){
            return 'Adattáblák betöltése sikertelen!';
        }
        else if(messageId == 'questionnaireNotFoundBySave'){
            return 'Újra kell kezdeni a kitöltést, mert megváltozott a kérdőív!';
        }
        else if(messageId == 'questionnaireAlreadyTerminated'){
            return 'Kérdőív szerkesztése nem lehetséges, mert már terminálva lett!';
        }
        else if(messageId == 'terminationNotAllowedByQuotaExceed'){
            return 'A választott termináció már nem elérhető, időközben kvótatúllépés történt!';
        }
        else if(messageId == 'numberOfQuestionnaireInstancesExceed'){
            return 'Jelenleg nincs több kitölthető kérdőív!';
        }
        else if(messageId == 'fileTooBig'){
            return 'A feltöltött fájl mérete nem haladhatja meg a 200 Mbyte-ot!';
        }
        else if(messageId == 'exceptionBySave'){
            return 'Hiba történt a mentés közben! Kérjük ellenőrizze a bemeneti értékek helyességét!';
        }

        else if(messageId == 'simpleChoiceRequired'){
            return 'A legördülő választóból egy válaszlehetőséget ki kell választani!';
        }
        else if(messageId == 'singleAnswerRequired'){
            return 'Válasz megjelölése kötelező!';
        }
        else if(messageId == 'radioButtonRowRequired'){
            return 'Minden sorban meg kell jelölni egy lehetséges értéket!';
        }
        else if(messageId == 'radioButtonColumnRequired'){
            return 'Minden oszlopban meg kell jelölni egy lehetséges értéket!';
        }
        else if(messageId == 'minOneAnswerRequired'){
            return 'Legalább egy mezőt ki kell tölteni!';
        }
        else if(messageId == 'minOneNotNullRequired'){
            return 'Legalább egy nem nulla értéket be kell állítani!';
        }
        else if(messageId == 'minOneGroupRequired'){
            return 'Legalább egy elemhez választani kell csoportot!';
        }
        else if(messageId == 'scrollBarEventRequired'){
            return 'Legalább az egyik csúszkát meg kell mozdítania!';
        }
        else if(messageId == 'minOneCharRequired'){
            return 'Legalább egy karaktert be kell írnia!';
        }
        else if(messageId == 'questionRequired'){
            return 'Kérdés kitöltése kötelező!';
        }
        return '';
    }

    this.hideServerResponseMessages = function(){
        this.showServerResponseMessages = false;
    }
});