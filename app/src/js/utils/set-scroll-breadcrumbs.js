export function scrollBreadcrumbs(scrollBox, scrollContent){

	function setScrollBreadcrumbs(scrollBox, scrollContent){
		var box = document.querySelector(scrollBox),
			content = document.querySelector(scrollContent),
			offset = 0,
			width = content.offsetWidth,
			li = content.querySelectorAll('li');

			for(var i = 0; i < li.length; i++){
				width += li[i].offsetWidth;
			}

			if(width > box.offsetWidth){
				offset = width - box.offsetWidth;

				box.scrollTo(offset, 0);
			}
	}

	if (window.addEventListener)
		window.addEventListener("load", setScrollBreadcrumbs(scrollBox, scrollContent), false);
	else if (window.attachEvent)
		window.attachEvent("onload", setScrollBreadcrumbs(scrollBox, scrollContent));
	else window.onload = setScrollBreadcrumbs(scrollBox, scrollContent);
}