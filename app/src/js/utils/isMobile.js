export function Android(){
	return navigator.userAgent.match(/Android/i);
}
export function BlackBerry(){
	return navigator.userAgent.match(/BlackBerry/i);
}
export function iOS(){
	return navigator.userAgent.match(/iPhone|iPod/i);
}
export function Opera(){
	return navigator.userAgent.match(/Opera Mini/i);
}
export function Windows(){
	return navigator.userAgent.match(/IEMobile/i);
}
export function any(){
	return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
}