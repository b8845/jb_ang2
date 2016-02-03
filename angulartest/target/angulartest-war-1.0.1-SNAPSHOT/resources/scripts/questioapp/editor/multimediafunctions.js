/**
 *   Multimédia tartalmak kezelése
 */
QuestioApp.service('MultimediaFunctions', function($rootScope, MessageFunctions, MultimediaTempService) {

    this.mediaPath = _contextPath + "/rest/editorrestservice/persistedmedia/";

    this.initTemplateForView = function(data){
        if (QuestioApp.Util.isInitialized(data.questions)) {
            $.each(data.questions, function (index, question) {
                if (QuestioApp.Util.isInitialized(question.multimedias)) {
                    $.each(question.multimedias, function (index, multimedia) {
                        multimedia.downloadLink = _contextPath + "/rest/editorrestservice/getpersistedmedia/null_4_0_mp4sample.mp4";
                    });
                }
            });
        }
        return data;
    }

    this.uploadMedia = function(template, question){
        var that = this;
        if($('.mediaupload-' + question.id).get(0).files.length == 0){
            MessageFunctions.showSingleMessageById('noUploadFileFound',null,'alert');
            return;
        }
        else{
            var file = $('.mediaupload-' + question.id).get(0).files[0];
            if(QuestioApp.Util.isDefinedAndNotNull(file) && QuestioApp.Util.isDefinedAndNotNull(file.size) && file.size > 209715200){
                MessageFunctions.showSingleMessageById('fileTooBig',null,'alert');
                return;
            }
            var multimediaDTO = new MultimediaEditorDTO();
            multimediaDTO.id = QuestioApp.Util.generateId(question.multimedias);
            multimediaDTO.multimediaName = file.name;
            multimediaDTO.mediaType = file.type;
            var fileId = template.id + '_' + question.id + '_' + multimediaDTO.id + '_' + file.name;
            if((file.name.substring( file.name.length - 3, file.name.length).toLowerCase() === 'jpg' ||
                file.name.substring( file.name.length - 3, file.name.length).toLowerCase() === 'png') &&
                (file.type == 'image/png' || file.type == 'image/jpeg')){
                multimediaDTO.multimediaType = 'Picture';
            }
            else if(file.name.substring( file.name.length - 3, file.name.length).toLowerCase() === 'mp3' && file.type == 'audio/mp3'){
                multimediaDTO.multimediaType = 'Audio';
            }
            else if(file.name.substring( file.name.length - 3, file.name.length).toLowerCase() === 'mp4' && file.type == 'video/mp4'){
                multimediaDTO.multimediaType = 'Video';
            }
            else{
                MessageFunctions.showSingleMessageById('wrongFileFormat',null,'alert');
                return;
            }

            var formData = new FormData();
            formData.append('file', file);

            $('.upload-loading-wrapper-' + question.id).removeClass('hidden');

            MultimediaTempService.save({fileName : multimediaDTO.multimediaName, contentType: multimediaDTO.mediaType}, formData).
                $promise.then(function(data) {
                    multimediaDTO.binaryFileId = data.ObjectId;
                    question.multimedias.push(multimediaDTO);
                    that.clearFileInput($('.mediaupload-' + question.id).get(0));
                    $rootScope.$apply();
                    $('.upload-loading-wrapper-' + question.id).addClass('hidden');
            }, function(error) {
                MessageFunctions.showSingleMessageById('mediaUploadError',null,'alert');
                $('.upload-loading-wrapper-' + question.id).addClass('hidden');
            });
        }
    }

    this.clearFileInput = function(ctrl){
        try {
            ctrl.value = null;
        } catch(ex) { }
        if (ctrl.value) {
            ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
        }
    }

    this.deleteMedia = function(question, templateHelper){
        templateHelper.deletedMediaIdList.push(question.multimedias[templateHelper.hoveredMultimediaIndex].binaryFileId);
        question.multimedias.splice(templateHelper.hoveredMultimediaIndex, 1);
        templateHelper.hideMultimediaDeleteButton();
    }
});