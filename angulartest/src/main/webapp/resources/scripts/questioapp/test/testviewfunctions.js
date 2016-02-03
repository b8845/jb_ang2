/**
 * Kérdések tesztelésével kapcsolatos felületi segédfunkciók
 */

QuestioApp.service('TestViewFunctions', ['$anchorScroll', '$location', function($anchorScroll, $location){

    this.gotoAnchor = function(x) {
        var newHash = 'anchor' + x;
        if ($location.hash() !== newHash) {
            $location.hash('anchor' + x);
        } else {
            $anchorScroll();
        }
    };

    this.scrollToElement = function(el, ms){
        // TODO 100 a header számolt magassága legyen
        var speed = (ms) ? ms : 600;
        $('html,body').animate({
            scrollTop: $(el).offset().top - 100
        }, speed);
    }

    this.changeQuestionInputStates = function (id, disabled){
        $('.other-dimesnion-test-input-' + id).each(function( index ) {
            $(this).prop('disabled', disabled);
        });
    }
}]);