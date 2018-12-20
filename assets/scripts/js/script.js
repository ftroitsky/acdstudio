/* Author:

*/




$(document).ready(function() {

if ($('#sunbunkerfade').length) {
	$('#sunbunkerfade').crossSlide({
		sleep: 3,
		fade: 2
	}, [
		{ src: '/assets/img/sunbunker/crop_main_2_940w.jpg' },
		{ src: '/assets/img/sunbunker/crop_main_1_940w.jpg'   }
	]);

}

if ($('#oktfade').length) {
	$('#oktfade').crossSlide({
		sleep: 3,
		fade: 2
	}, [
		{ src: '/assets/img/okt/MainHall_Day_01_940w.jpg' },
		{ src: '/assets/img/okt/MainHall_Day_02_940w.jpg'   }
	]);
}



$('.bond-touchmargin').bond({ desktopMode: 'touchMargin', mobileMode: 'touchMargin'});

$('a.menu-btn').click(function () {$('ul.the-menu').slideToggle('medium')});



$.piroBox_ext({
	piro_speed :700,
	bg_alpha : 0.5,
	piro_scroll : true,
	piro_drag :false,
	piro_nav_pos: 'bottom'});
});

$(window).load(function(){

$('#index-main #menu-menu').css('opacity', 0);

 $('#menu-btn-self').click(function(){

	$('#index-main #menu-menu').stop().fadeTo(500, 1);

	});

	//for each description div...
	$('#index-menu div.proj-label').each(function(){
		//...set the opacity to 0...
		$(this).css('opacity', 0);

		//..set width same as the image...
		$(this).css('width', $(this).siblings('img').width());
		//...get the parent (the wrapper) and set it's width same as the image width... '
		$(this).parent().css('width', $(this).siblings('img').width());
		//...set the display to block
		$(this).css('display', 'block');
	});


	$('#index-menu li').hover(function(){
		//when mouse hover over the wrapper div
		//get it's children elements with class description '
		//and show it using fadeTo
		$(this).children('.proj-label').stop().fadeTo(200, 1);
	},function(){
		//when mouse out of the wrapper div
		//use fadeTo to hide the div
		$(this).children('.proj-label').stop().fadeTo(200, 0);
	});

});



