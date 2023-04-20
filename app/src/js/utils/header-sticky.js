export function headerSticky(){

	function headerStickScroll(){
		if($('.popup-win').hasClass('active')) return;
		if($('.mobile-panel').hasClass('active')) return;

		var header = document.getElementById('header'),
			wrapper = document.querySelector('.wrapper'),
			//mobilePanel = document.querySelector('.mobile-panel'),
			scrollTop = document.documentElement.scrollTop || document.body && document.body.scrollTop || 0;

		if(header == null) return;

		if(scrollTop > 100){
			header.classList.add('stick');
			wrapper.classList.add('stick');
		} else {
			//if(!mobilePanel.classList.contains('active')){
				header.classList.remove('stick');
				wrapper.classList.remove('stick');
			//}
		}
	}

	function headerStickInit(){
		if (window.addEventListener){
			window.addEventListener("scroll", headerStickScroll, false);
		}
		else
		if (window.attachEvent){
			window.attachEvent("scroll", headerStickScroll);
		}
		else {
			window.onscroll = headerStickScroll;
		}
		headerStickScroll();
	}

	if (window.addEventListener)
		window.addEventListener("load", headerStickInit, false);
	else if (window.attachEvent)
		window.attachEvent("onload", headerStickInit);
	else window.onload = headerStickInit;
}