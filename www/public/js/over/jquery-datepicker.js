$.datepicker._defaults.onAfterUpdate = null;
var datepicker__updateDatepicker = $.datepicker._updateDatepicker;
$.datepicker._updateDatepicker = function( inst ) {
	datepicker__updateDatepicker.call( this, inst );
	var onAfterUpdate = this._get(inst, 'onAfterUpdate');
	if (onAfterUpdate)
		onAfterUpdate.apply((inst.input ? inst.input[0] : null),
				[(inst.input ? inst.input.val() : ''), inst]);
};


function DatePicker(selector, callback) {
	var cur = prv = (new Date()).getTime() - 24*60*60*1000; //-1d
    

	var $container = $('<div>', {"class": "date-picker"});
	
	var $close = $('<span>', {"class": "glyphicon glyphicon-remove close-btn btn-danger"});
	$close.appendTo( $container );
	$close.on("click", function(){
		$container.hide();
		callback();
	});
	
	$("body").append( $container );

	$container.draggable();

	$container
	.datepicker({
		//buttonImageOnly: true,
		showAnim: "slideDown",
		dateFormat: "dd/mm/yy",
		maxDate: "-1d",
		defaultDate: "-1d",
		closeText: "Close",
		numberOfMonths: 2,
		showButtonPanel: true,
		beforeShowDay: function ( date ) {
			return [true, ( (date.getTime() >= Math.min(prv, cur) && date.getTime() <= Math.max(prv, cur)) ? 'date-range-selected' : '')];
		},
		onSelect: function ( dateText, inst ) {
			prv = cur;
			cur = (new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay)).getTime();
			if ( prv == -1 || prv == cur ) {
				prv = cur;
			}
		},
		onChangeMonthYear: function ( year, month, inst ) {
			//prv = cur = -1;
		},
		onAfterUpdate: function ( inst ) {
			$('<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click">Done</button>')
			.appendTo($container.find('.ui-datepicker-buttonpane'))
			.on('click', function () { 
				$container.hide();
				d1 = (new Date(Math.min(prv,cur))).getTime();
				d2 = (new Date(Math.max(prv,cur))).getTime();
				callback( d1, d2 );

			});
		}
	})
	.position({
		my: 'right top',
		at: 'right bottom',
		of: $( selector )
	})
	.hide();



	this.show = function() {
		if ( cur > -1 )
			$container.datepicker('setDate', new Date(cur));
		
		$container.datepicker('refresh').show();
	};
}