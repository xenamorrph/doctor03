export function spoiler(){


	$('.js-spoiler-toggle').click(function(){
		var box = $(this).closest('.js-spoiler-box');

		if(box.hasClass('active')){
			box.removeClass('active');
			box.find('.js-spoiler-hidden').removeAttr('style');
		} else {
			//$('.js-spoiler-box .js-spoiler-hidden').removeAttr('style');

			var h = box.find('.js-spoiler-content').innerHeight();

			//$('.js-spoiler-box').removeClass('active');

			box.addClass('active');
			box.find('.js-spoiler-hidden').height(h);
		}

	});
}