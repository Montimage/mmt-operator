$.datepicker._defaults.onAfterUpdate = null;
var datepicker__updateDatepicker = $.datepicker._updateDatepicker;
$.datepicker._updateDatepicker = function( inst ) {
   datepicker__updateDatepicker.call( this, inst );
   var onAfterUpdate = this._get(inst, 'onAfterUpdate');
   if (onAfterUpdate)
      onAfterUpdate.apply((inst.input ? inst.input[0] : null),
         [(inst.input ? inst.input.val() : ''), inst]);
}

$(function() {
   var cur = -1, prv = -1;
   $('#jrange div')
      .datepicker({
            //numberOfMonths: 3,
            changeMonth: true,
            changeYear: true,
            showButtonPanel: true,
            beforeShowDay: function ( date ) {
                  return [true, ( (date.getTime() >= Math.min(prv, cur) && date.getTime() <= Math.max(prv, cur)) ? 'date-range-selected' : '')];
               },
            onSelect: function ( dateText, inst ) {
                  var d1, d2;
                  prv = cur;
                  cur = (new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay)).getTime();
                  if ( prv == -1 || prv == cur ) {
                     prv = cur;
                     $('#jrange input').val( dateText );
                  } else {
                     d1 = $.datepicker.formatDate( 'mm/dd/yy', new Date(Math.min(prv,cur)), {} );
                     d2 = $.datepicker.formatDate( 'mm/dd/yy', new Date(Math.max(prv,cur)), {} );
                     $('#jrange input').val( d1+' - '+d2 );
                  }
               },
            onChangeMonthYear: function ( year, month, inst ) {
                  //prv = cur = -1;
               },
            onAfterUpdate: function ( inst ) {
                  $('<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click">Done</button>')
                     .appendTo($('#jrange div .ui-datepicker-buttonpane'))
                     .on('click', function () { $('#jrange div').hide(); });
               }
         })
      .position({
            my: 'left top',
            at: 'left bottom',
            of: $('#jrange input')
         })
      .hide();
   $('#jrange input').on('focus', function (e) {
         var v = this.value,
             d;
         try {
            if ( v.indexOf(' - ') > -1 ) {
               d = v.split(' - ');
               prv = $.datepicker.parseDate( 'mm/dd/yy', d[0] ).getTime();
               cur = $.datepicker.parseDate( 'mm/dd/yy', d[1] ).getTime();
            } else if ( v.length > 0 ) {
               prv = cur = $.datepicker.parseDate( 'mm/dd/yy', v ).getTime();
            }
         } catch ( e ) {
            cur = prv = -1;
         }
         if ( cur > -1 )
            $('#jrange div').datepicker('setDate', new Date(cur));
         $('#jrange div').datepicker('refresh').show();
      });
});