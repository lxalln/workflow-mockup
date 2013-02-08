	var element;
	var options;
	var controlWidth;  	
	var dayWidth;
	var rows = 0;

(function($){
 $.fn.workflow_timeline = function(options) {  

  
  var defaults = {
  daysToShow: 60,
  rowGap: 60,
  tipGap: 40
  };
  
  options = $.extend(defaults, options);
    
  return this.each(function() {
   element = $(this).children('#eventContainer');   
   
	controlWidth = element.width();
	dayWidth =  controlWidth / options.daysToShow;
	clashWidth = Math.ceil(140 / dayWidth) +1;

	//alert(clashWidth);
	
	createDivider(55);
	createDayTicks();
	addRows(9);
	createevent(-1, 48, 1, [3, 18, 19, 41, 47], [['Test Failed', '18/01/2010'], ['Investigation Forms Sent', '21/01/2010'], ['Response Due By', '04/02/2010'], ['Reminder Sent', '05/02/2010'], ['Response Due By', '19/02/2010'], ['Test Passed', '25/02/2010']]);
	createevent(14, 14, 2, [3, 4, 6, 8, 10], [['Test Failed', '18/01/2010'], ['Investigation Forms Sent', '21/01/2010'], ['Response Due By', '04/02/2010'], ['Reminder Sent', '05/02/2010'], ['Response Due By', '19/02/2010'], ['Test Passed', '25/02/2010']]);
	createevent(36, 14, 2, [2,5,7,10]);
	createevent(45, 25, 3, [1,2,3,4,5,6,7,8,9]);
	
	$('div').click(function(){
		$(this).stop(true, false).fadeTo('slow', 1);
		$(this).siblings().removeClass('selected shadow').stop(true, false).fadeTo('slow', 1);
		$(this).siblings().children().stop(true, false).fadeTo('slow', 1);
		$(this).siblings().children('.event-split-tip').hide();
		$(this).siblings().children('.event-split-selected').hide();
	});

	$('.event').click(function(){		
		$(this).addClass('selected shadow');	
		$(this).children('.event-split-selected').show()		
		.children('.event-split-tip').show()
		.css('z-index', 60);	
		
		$(this).siblings().removeClass('selected').removeClass('shadow');
		$(this).siblings('.event').stop(true, false).fadeTo('slow', 0.3);
	});

	$('.event').hover(function(){
		$(this).addClass('event-hover');
		if($('.selected').length === 0)
			$(this).siblings('.event').stop(true, false).fadeTo('slow', 0.3);
			$(this).siblings('.event').children('.event-split').stop(true, false).fadeTo('slow', 0.3);
		}, function() {
		$(this).removeClass('event-hover');
		if($('.selected').length === 0){
			$(this).siblings('.event').stop(true, false).fadeTo('slow', 1);
			$(this).siblings('.event').children(':visible').stop(true, false).fadeTo('slow', 1);
		}
		$(this).siblings().show();
	});
	
	$('.event-split-tip').hover(function(){
		$(this).parents('.event-split-selected').addClass('event-split-selected-hover');
		//$(this).parents().siblings().children('.event-split-tip').stop(true, false).fadeTo('slow', 0.7);
	}, function(){
		$(this).parents('.event-split-selected').removeClass('event-split-selected-hover');
		//$(this).parents().siblings().children('.event-split-tip').stop(true, false).fadeTo('slow', 1);
	});
   
   function addRow(){
	element.append('<hr noshade style="top: ' + (options.rowGap * ++rows) + 'px ;" class="caseRule"/>');
}

function addRows(count){
	for( var i = 0; i < count; i++)
		addRow();
}

function createDayTicks(){
	for(var i = 1; i < options.daysToShow; i++){
		var pos = toPixels(i);
		element.append('<div class="dayTick" style="left: ' + pos + 'px;"></div>');
	}
}

function createDivider(pos){
	if(pos > options.daysToShow) pos = options.daysToShow;
	element.append('<div class="divider" style="width: ' + dayWidth * pos + 'px;"></div>');
}

function createevent(left, width, row, splits, tips){
	var top = (options.rowGap * row) - 10;
	var borderStyle = '';
	var tooEarly = left < 0;
	var tooLate = left + width > options.daysToShow; 
	
	if(tooLate) width = options.daysToShow - left;

	var convertedLeft = toPixels(left);
	var convertedWidth = toPixels(width);
	
	if(convertedLeft < 0) {
		//convertedLeft = 0;
		convertedWidth += (left * dayWidth);
	}

	convertedWidth -= 1; //to account for the border!
	
	if(tooEarly){
		borderStyle = 'border-left: none;';
		convertedWidth += 1;
	}
	
	if(tooLate) borderStyle = 'border-right: none;';

	var event = '<br /><div class="event" style="width: ' 	+ convertedWidth 	+ 'px; top: ' + top + 'px; left: ' + ((convertedLeft < 0) ? 0 : convertedLeft)+ 'px;' 	+ borderStyle 	+'"><span class="event-title">UPC: 43363' + row + '</span>';

	if(splits !== null){		
		var newTop = options.tipGap;
		var previousTop = options.tipGap;
		var lastReset = 0; //splits.length - 1;
		var lastResetAgainst = 0;
		var lastResetTop = options.tipGap;
		var resets = 0;
		for(var i = 0; i < splits.length; i++){ // i >= 0; i--){
			var splitPos = splits[i];
			var convertedSplitPos = splitPos * dayWidth;
			
			if(!tooEarly) convertedSplitPos -= 1;

			var gapToNext = 0;
			
			var current = splits[i];
			var next = splits[i+1];

			if(willClash(current, next)){	//they clash
				newTop += options.tipGap;			//drop the item down
				
				var initialTop = newTop;
				
				for(var j = lastResetAgainst + 1; j < i; j++){ //loop through to see if we can fit the tip in higher
					if(!willClash(next, splits[j])){	//we found an item we don't clash with
						newTop = lastResetTop;					//reset the position to the top
						
						var k = lastReset;
						
						if(willClash(next, splits[lastReset])){							
							while(k < i+1){
								if(willClash(next, splits[k])){
									newTop += options.tipGap;
									k++;
								}else break;
							}
						}
						
						if(newTop !== initialTop){	//sometimes an item may appear to reset, but actually it's not
							lastReset = i+1;
							lastResetTop = newTop;
							lastResetAgainst = j;
							resets++;
						}
						
						break;
					}					
				}
			}
			else{	//we don't clash, so we must sit at the top.
				newTop = options.tipGap;
				lastResetAgainst = i+1;
				lastReset = i+1;	//this counts as a reset				
				resets++;
			}
			
			if(splitPos > 0){
				if(left + splitPos < left + width + 1){
					var split = '<div class="event-split" style="left: ' + convertedSplitPos + 'px;"></div>';
					var selectedSplit = '<div class="event-split-selected" style="left: ' + convertedSplitPos + 'px; height: '+previousTop+ 'px;">';
					event += split;
					
					var tipTitle = 'Test Title';
					var tipBody = '02/09/2010';
					if(typeof(tips)!="undefined"){
						tipTitle = tips[i+1][0];
						tipBody = tips[i+1][1];
					}
					var tip = '<div class="event-split-tip shadow" style="left: 0' /*+ convertedSplitPos*/ + 'px; top: ' + previousTop + 'px;"><span class="tip-title">' + tipTitle + '</span><br/>' + tipBody + '</div>';
						//event += tip;
						
						selectedSplit += tip + '</div>';
						event += selectedSplit;
				}
			}
			
			var endSelectedSplit = '<div class="event-split-selected" style="right: -1px; height: '+previousTop+ 'px;"></div>';
			
			previousTop = newTop;
		}
	}

	event += '</div>';
	
	element.append(event);
}

function willClash(a, b){
	return (Math.abs(a - b) < clashWidth);
}

function toPixels(dayPos){
	return dayPos * dayWidth;
}
   
  });
 };
})(jQuery);


$(document).ready(function() {
	$('#timeline').workflow_timeline({daysToShow: 60} );
});


