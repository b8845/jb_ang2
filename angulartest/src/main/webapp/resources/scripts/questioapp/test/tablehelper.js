/**
 * Kérdések klónozásának segédosztálya
 */

TableHelper = function () {

    this.tableHeightMax = 600;

    this.scrollbarHeight = 30;

    this.tableWrapperPadding = 20;

    this.initTables = function(){
        var tableHelper = this;
        $('.questio-test-table').each(function( index ) {
            tableHelper.killFixedHeaderTableBugs1();

            var tableParams = {};
            var height = $(this).outerHeight(true) + tableHelper.scrollbarHeight;
            if(height > tableHelper.tableHeightMax){
                height = tableHelper.tableHeightMax;
                tableParams.height = height + '';
            }

            var width = $(this).closest('.question-test-body').outerWidth(true) - tableHelper.tableWrapperPadding;
            if($(this).outerWidth() > width){
                tableParams.height = height + '';
                tableParams.fixedColumns = 1;
            }
            $(this).fixedHeaderTable(tableParams);
            tableHelper.killFixedHeaderTableBugs2();
        });
    }

    this.killFixedHeaderTableBugs1 = function(){
        // ugly hack 1 -,-
        $('.test-table-column-header').each(function( index ) {
            $(this)[0].setAttribute("style", "width: " + $(this).outerWidth() + "px!important;");
        });
    }

    this.killFixedHeaderTableBugs2 = function(){
        // ugly hack 2 -,-
//        var colHeaderWidth = '0px';
//        $('.questio-test-table-body-row-header').each(function( index ) {
//            if(index == 0){
//                colHeaderWidth = $(this).css('width');
//            }
//            else{
//                $(this).css('width', colHeaderWidth + '!important');
//            }
//        });
//
        $('.fht-table-wrapper').each(function( index ) {
            var tableWidth = 0;
            $(this).find('.questio-test-table').each(function( index ) {
                if(index == 0){
                    tableWidth = $(this).outerWidth();
                }
                else if($(this).outerWidth() != tableWidth){
                    $(this).css('width', tableWidth + 'px!important');
                }
            });
        });

//        var colCnt = $('.questio-test-table')[$('.questio-test-table').length-1].dataset.columncnt;
//        for(var i = 0; i < colCnt; i++){
//            var colWidth = '0px';
//            $('.test-column-' + i).each(function( index ) {
//                if(index == 0){
//                    colWidth = $(this).css('width');
//                }
//                else{
//                    $(this).css('width', colWidth + '!important');
//                }
//            });
//        }
    }
};