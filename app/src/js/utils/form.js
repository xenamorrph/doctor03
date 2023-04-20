export function form(){

	if(!isMobile.any()){
		$('form input[name="phone"]').mask('+7 (999) 999-99-99', {
			placeholder: "+7 (___) ___-__-__",
			autoclear: false
		});
	}

	$.datepicker.setDefaults({
		closeText: "Закрыть",
		prevText: "&#x3C;Пред",
		nextText: "След&#x3E;",
		currentText: "Сегодня",
		monthNames: [ "Январь","Февраль","Март","Апрель","Май","Июнь",
		"Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ],
		monthNamesShort: [ "Янв","Фев","Мар","Апр","Май","Июн",
		"Июл","Авг","Сен","Окт","Ноя","Дек" ],
		dayNames: [ "воскресенье","понедельник","вторник","среда","четверг","пятница","суббота" ],
		dayNamesShort: [ "вск","пнд","втр","срд","чтв","птн","сбт" ],
		dayNamesMin: [ "Вс","Пн","Вт","Ср","Чт","Пт","Сб" ],
		weekHeader: "Нед",
		dateFormat: "dd-mm-yy",
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ""
	});

	$('body')
		.on('focus', '.popup-form input, .popup-form select, .popup-form textarea', function(){
			$(this).addClass('active');
		})
		.on('blur', '.popup-form input, .popup-form select, .popup-form textarea', function(){
			if($(this).val().trim() == ''){
				$(this).removeClass('active');
			}
			else if($(this).val().trim().replace(/\+7\s*\(___\)\s*___-__-__/, '').length == 0){
				$(this).removeClass('active');
			}
		})
		.on('change', '.popup-form select', function(){
			if($(this).val().trim() == ''){
				$(this).removeClass('active');
			}
		})

	// для старых форм
	$('input.b-form__control--date').prop('autocomplete', 'off');
	$('input.b-form__control--date').datepicker({minDate: new Date()});
	$('input.b-form__control--date').prev('label').click(function(){
		$(this).next('input').focus();
	});


	$("#js-popup-calendar").datepicker({
		minDate: new Date(),
		onSelect: function(dateText){
			$('.js-popup-select-date').val(dateText).addClass('active');
			$('.form-popup-calendar').removeClass('active');
		}
	});

	$('.js-popup-select-date')
		.click(function(e){
			e.preventDefault();
			$('.form-popup-calendar').addClass('active');
		})
		.focus(function(e){
			e.preventDefault();
			$('.form-popup-calendar').addClass('active');
		})
		.keypress(function(e){
			e.preventDefault();
		});
	$(document).mouseup(function(e){
		var container = $(".form-popup-calendar");
		if($(this).find(".form-popup-calendar").hasClass('active')){
			if (!container.is(e.target) && container.has(e.target).length === 0) {
				container.removeClass('active');
			}
		}
	});



	var formSender = {
		formData: {},
		locker: false,
		domain: 'sm-stomatology.ru',
		url: '/local/templates/sm-new/ajax/form.php',
		action: 'feedback',
		sourcesData: {},
		init: function(){
			var self = this;

			$('body').on('submit', '.js-feedback-submit, .tao-form-Appointment, .tao-form-Callback, .tao-form-Review, .tao-form-Lab, #question-online-mainform, #mainform', function(e){
				e.preventDefault();

				var form = $(this);
				//self.formData = $(this).serializeArray();//.map(function(v){return [v.name, v.value];}));


				if(self.locker) return;
					
				if(!self.validate(form)) return;

				self.sources(form);

				self.send(form);
				//self.data = $(this).serialize()
			});
		},
		sources: function(form){
			var	self = this;

			//if(sbjs == 'undefined') return;

			sbjs.init({
				session_length: 1,
				domain: {
					host: self.domain,
					isolate: true
				},
				timezone_offset: 3
			});

		    try {
		        ga(function(tracker) {
		            var referrer = sbjs.get.current_add.rf;
		            if(sbjs.get.current.src == 'yandex') {
		                var referrer = sbjs.get.current.src;
		            }
		            self.sourcesData = {
		                'clientid': tracker.get('clientId'),
		                'type': sbjs.get.current.typ,
		                'referrer': referrer,
		                'source': sbjs.get.current.src,
		                'medium': sbjs.get.current.mdm,
		                'campaign': sbjs.get.current.cmp,
		                'keyword': sbjs.get.current.trm
		            }
		        });
		    } catch (err) {};
		    
		},
		submit: function(){

		},
		validate: function(form){
			var self = this;

			form.find('.error').removeClass('error');

			if(form.find('input[name="phone"]').length){
				if(form.find('input[name="phone"]').val().replace(/[^\d]/ig, '').length < 10){
					form.find('input[name="phone"]').addClass('error');
					return false;
				} else {
					form.find('input[name="phone"]').removeClass('error');
				}
			}

			return true;

		},
		send: function(form){
			var self = this,
				formtype = form.find('input[name="formtype"]').val(),
				formAnalytic = form.find('input[name="analytic"]').length ? form.find('input[name="analytic"]').val() : false;

			// костыль для старых форм
			self.crutch(form);

			$.ajax({
				type: 'POST',
				dataType: 'JSON',
				url: self.url,
				data: form.serialize()+'&action='+self.action+'&'+$.param(self.sourcesData),
				beforeSend: function(xhr){
					form.addClass('sending');
					form.find('button[type="submit"], input[type="submit"]').prop('disabled');
					self.locker = true;
					setTimeout(function(){self.locker = false;}, 5000);
				},
				success: function(data) {
					if(data.success){

						if(form.find('input[name="analytics"]').length){
							var analytics = form.find('input[name="analytics"]').val();
							if(analytics != ''){
								ga('send', 'event', 'Form', 'Send', analytics);
							}
							
						}
						yaCounter42012629.reachGoal('FormSend');

						// сообщение об успешной отправке
						self.success(form, data.message);
						
					}
					else{
						for(var prop in data.errors){
							form.find('input[name="'+prop+'"]').addClass('error');
						}
					}

					form.removeClass('sending');
					form.find('button[type="submit"], input[type="submit"]').removeAttr('disabled');
					self.locker = false;
				}
			});
		},
		success: function(form, message){
			if(form.hasClass('popup-form__form')){
				form.find('.popup-form__title, .popup-form__body, .popup-form__footer').empty();
				form.find('.popup-form__body').append('<div class="popup-form__success">'+message+'</div>');
			}
			else{
				form.find('.form__header, .form__body, .form__footer').empty();
				form.find('.form__body').append('<div class="popup-form__success">'+message+'</div>');
			}
		},
		crutch: function(form){
			// костыль для некоторых старых форм
			if(form.attr('id') == 'question-online-mainform'){
				form.append('<input type="hidden" name="formtype" value="consultation">');
				form.append('<input type="hidden" name="analytic" value="consultation">');
			}
/*			else if(){

			}*/
		}
	}

	formSender.init();

}