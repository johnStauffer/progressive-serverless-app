var globalNavTrigger = document.querySelector('#js-menu');
var globalNav = document.querySelector('#js-global-nav');
if( globalNavTrigger && globalNav ) {
	globalNavTrigger.addEventListener('click', (function(e) {
		e.preventDefault();
		globalNav.classList.toggle('active');
	}));
}