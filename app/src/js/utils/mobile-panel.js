export function mobilePanel(){

	var winH = (window.innerHeight > 0) ? window.innerHeight : screen.height,
		winW = (window.innerWidth > 0) ? window.innerWidth : screen.width;

	$(window).resize(function(){
		winH = (window.innerHeight > 0) ? window.innerHeight : screen.height;
		winW = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	});

	$('.js-panel-toggle').click(function(){
		// если открыто
		if($('.mobile-panel').hasClass('active')){
			$('.mobile-panel').removeClass('open');
			$('body').removeClass('pop-up-enabled');
			$('body').scrollTop($('body').data('scrolltop'));
			$(window).scrollTop($('body').data('scrolltop'));

			$('.mobile-panel').removeClass('active').addClass('unactive');
				setTimeout(function(){
					$('.mobile-panel').removeClass('unactive h-auto');
				},500);
		// если закрыто
		} else {
			var scrolltop = $('body').scrollTop() ? $('body').scrollTop() : $(window).scrollTop();
			$('body').data('scrolltop', scrolltop);
			$('body').css('top', -scrolltop);

			$('.mobile-panel').removeClass('unactive');
			$('.mobile-panel').addClass('active');

			if($('.mobile-panel__container').height() > winH){
				$('.mobile-panel').addClass('h-auto');
			}

			$('body').addClass('pop-up-enabled');
			setTimeout(function(){
				$('.mobile-panel').addClass('open');
			},500);
		}
	});

	$('.mobile-menu__link').click(function(e){
		if(!$(this).data('index')) return;
		
		var indx = $(this).data('index') - 1;

		if($('.mobile-menu__level-2 .mobile-menu__submenu').eq(indx).find('.mobile-menu__link').length){
			 e.preventDefault();	
			$('.mobile-menu, .mobile-panel__header-slide').addClass('pos-2');
			$('.mobile-menu__level-2 .mobile-menu__submenu').removeClass('active').eq(indx).addClass('active');
		}

	});

	$('.mobile-panel__go-back').click(function(){
		$('.mobile-panel').find('.pos-2').removeClass('pos-2');
		$('.mobile-panel').find('.pos-1').removeClass('pos-1');
		$('.mobile-panel__results').removeClass('active');
	});

	$('.mobile-menu__level-1 .mobile-menu__link').each(function(i){
		if(!$('.mobile-menu__level-2 .mobile-menu__submenu').eq(i).find('.mobile-menu__link').length){
			$(this).find('.i-arrow-right').removeClass('i-arrow-right');
		}
	});
}