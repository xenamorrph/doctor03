$(document).ready(function() {
	$('html').append('<div id="_dev-menu"><ul style="padding:10px; margin:0;"></ul><div id="_dev-menu-close">Закрыть</div></div>')
	.on('click', "#_dev-menu-close", function(){
		$("#_dev-menu").remove();
	})

	$.ajax({
		dataType: "json",
		url: '/pages.json',
		data: '',
		success: function(data){
			console.log(data.sort());
			for(prop in data){
				$('html').find('#_dev-menu ul').append('<li><a style="color:#fff;" href="/'+data[prop]+'">'+data[prop].replace(/\.html$/, '')+'</a>');
			}
		}
	});

});