"use strict";

export function init(){
	this.url = '/local/templates/sm-new/ajax/loadform.php';
	this.locker = false;
	this.params = {
		action: 'loadform',
		target: ''
	};
	this.addInput = {
		analytics: false
	};
	var self = this;


	$('body').on('click', '.js-open-popup', function(e){
		e.preventDefault();

		self.addInput.analytics = $(this).data('analytics');
		self.showWin($('.popup-win'));
		self.showForm($(this).data('target'));
	});
	$('body').on('click', '.js-popup-close', function(e){
		e.preventDefault();

		self.showWin($('.popup-win'), true);
		$('.popup-form').removeClass('active');
	});

	// совместимость со старым дизайном
	$('a[href="#"]').click(function(e){
		var target = $(this).data('target'),
			selector = false;
		
		if(target == '#modal-ask-question'){
			self.addInput.analytics = 'AskQuestion_H1';
			selector = '.popup-form-question';
		}
		else if(target == '#modal-support'){
			selector = '.popup-form-administration';
		}
		else if(target == '#modal-review'){
			selector = '.popup-form-review';
		}
		else if(target == '#modal-feedback'){
			// установка анатилики для кнопок в контенте на странице врача и разводящей
			if($(this).parent().hasClass('b-card__btn-panel') || $(this).parent().hasClass('b-doctor-card__text')){
				self.addInput.analytics = 'OrderDoctor';
			} else {
				self.addInput.analytics = 'OrderDoctor_Toolbar';
			}
			
			selector = '.popup-form-feedback';
		}
		else if(target == '#modal-callback'){
			self.addInput.analytics = 'OrderCall_Toolbar';
			selector = '.popup-form-callback';
		}
		else if(target == '#modal-lab'){

			if($('#product-name').length){
				$('.popup-form-lab').find('.popup-form__title').text('Купить "'+$('#product-name'+'"').val());
			}
			if($('input.lab-amount').length){
				$('.popup-form-lab').find('input[name="amount"]').val($('input.lab-amount').val());
			}

			self.addInput.analytics = '';
			selector = '.popup-form-lab';
		}

		if(selector){
			e.preventDefault();
			self.showWin($('.popup-win'));
			self.showForm(selector);
			return;
		}


		// для страницы онлайн консультация врача
		if($(this).parent().hasClass('banner_expert_btn')){
			e.preventDefault();
			
			self.addInput.analytics = 'GetConsult_Stat';

			self.showWin($('.popup-win'));
			self.showForm('.popup-form-consultation');
		}
		else if($(this).parent().hasClass('select_specialist_item_btn')){
			e.preventDefault();
			var data = $(this).data('name') ? $(this).data('name') : false;

			self.addInput.spec = data;
			self.addInput.analytics = 'GetConsult_Stat';

			self.showWin($('.popup-win'));
			self.showForm('.popup-form-consultation');
		}
	});
}
export function showWin(el, close){
	var close = close ? true : false;

	if(el.hasClass('active') && !close) return;

	if(el.hasClass('active')){
		$('body').removeClass('pop-up-enabled');
		
		$('body').scrollTop($('body').data('scrolltop'));
		$(window).scrollTop($('body').data('scrolltop'));

		el.removeClass('active').addClass('unactive');
			setTimeout(function(){
				el.removeClass('unactive');
			},200);
	} else {
		var scrolltop = $('body').scrollTop() ? $('body').scrollTop() : $(window).scrollTop();
		$('body').data('scrolltop', scrolltop);
		$('body').css('top', -scrolltop);

		el.removeClass('unactive');
		el.addClass('active');
		$('body').addClass('pop-up-enabled');
	}
}
export function showForm(selector){
	var self = this,
		el = $('.popup-win').find(selector);
	
	// если формы нет в теле страницы, пробуем ее подгрузить
	if(!el.length){
		self.get(selector);
	} else {
		self.addParams(selector);

		if($('.popup-form.active').length){
			if($('.popup-form.active').hasClass(selector)){
				$('.popup-form.active').removeClass('active');
			} else {
				$('.popup-form.active').removeClass('active');
				el.addClass('active');
			}
		} else {
			el.addClass('active');
		}
	}
}
export function get(selector){
	var self = this,
		container = $('.popup-win');

	if(container.find(selector).length) return;
	if(self.locker) return;

	self.params.target = selector;

	$.ajax({
		type: 'POST',
		dataType: 'JSON',
		url: self.url,
		data: self.params,
		beforeSend: function(xhr){
			container.addClass('sending');
			self.locker = true;
			setTimeout(function(){self.locker = false;}, 5000);
		},
		success: function(data) {
			if(data.success){
				$('.popup-win__box').append(data.html);
				self.showForm(selector);

				// после добавления формы на страницу, вешаем маску на телефон
				if($('.popup-win').find(selector+' input[name="phone"]').length){
					$('.popup-win').find(selector+' input[name="phone"]').mask('+7 (999) 999-99-99', {
						placeholder: "+7 (___) ___-__-__",
						autoclear: false
					});
				}

				// если у кнопки вызвавшей попап были data параметры, добавляем их в форму после загрузки
				self.addParams(selector);
			}
			else{
				
			}

			container.removeClass('sending');
			self.locker = false;
		}
	});
}
export function addParams(selector){
	var self = this,
		el = $('.popup-win').find(selector).find('form');

	if(self.addInput != false){
		for(var prop in self.addInput){
			if(el.find('input[name="'+prop+'"]').length){
				el.find('input[name="'+prop+'"]').val(self.addInput[prop]);
			} else {
				el.append('<input type="hidden" name="'+prop+'" value="'+self.addInput[prop]+'">');	
			}
		}
	}
}
export function open(selector){
	this.showWin($('.popup-win'));
	this.showForm(selector);
}