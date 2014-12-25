/* jBond Slider 0.9 */
/* Andrew Marcus & Love Media, 2010 */
/* Licensed under MIT */

(function($) {
	$.fn.extend({
		bond: function(settings) {
			jQuery.extend(jQuery.easing,{easeOutExpo:function(x,t,b,c,d){return(t==d)?b+c:c*(-Math.pow(2,-10*t/d)+1)+b;}});
			
			var defaults = {
				orientation: 'horz',			// Horizontal or Vertical
				restArea: 6,					// Rest area width in px
				maxSpeed: 7,					// Max speed
				startPos: 0,					// Left = 0, Right = 1, Center = 2
				desktopMode: 'move',			// move, touchMargin, touchCss
				mobileMode: 'touchCss',			// touchCss, touchMargin
				wrapperSelector: '.bond-wrapper',
				boxSelector: '.bond-box',
				slideSelector: '.bond-slide',
				easingCss: 'cubic-bezier(0,1,1,1)',
				easingMargin: 'easeOutExpo',
				timeBounce: '0.01s',
				timeScroll: '3s',
				timeBack: '0.5s',
				maxVelocity: 15,
				bounce: 5,
				slideClickCallback: function(N, delta) { }
			}
			
			if (!settings) settings = defaults;
			
			for (option in defaults) {
				if (!(option in settings) || settings[option] === undefined) settings[option] = defaults[option];
			}
			
			var isMobile = false;
			var isiPad = navigator.userAgent.match(/iPad/i) != null;
			var isiPhone = navigator.userAgent.match(/iPhone/i) != null;
			var isiPod = navigator.userAgent.match(/iPod/i) != null;
			if (isiPad || isiPhone || isiPod) isMobile = true;
			
			function get3dCoord(type, node) { // Reads X or Y from the transform property
				var style;
				if (typeof document.body.style.transform != 'undefined') {
					style = node[0].style.transform.toString();
				} else if (typeof document.body.style.webkitTransform != 'undefined') {
					style = node[0].style.webkitTransform.toString();
				} else if (typeof document.body.style.mozTransform != 'undefined') {
					style = node[0].style.mozTransform.toString();
				} else if (typeof document.body.style.oTransform != 'undefined') {
					style = node[0].style.oTransform.toString();
				} else {
					console.log('Your browser does not support css transforms');
					return 0;
				}
				return parseInt(style.substring(style.indexOf('(') + 1).split(',')[type]) || 0;
			}
			
			return this.each(function() {
				var mode; 					// move, css, margin
				var scrollspeed = 0;
				var movestate = '';
				var lefttime, toptime;		// Timers for back moving
				var righttime, bottomtime;	// Timers for forward moving
				var touchstartPos;
				var touchtime;
				var delta;
				var velo;
				var bond = $(this);
				var wrapper = bond.children(settings.wrapperSelector);
				var box = wrapper.children(settings.boxSelector);
				var bondtall = 0;
				var actualtall = 0;
				
				if (settings.orientation == 'horz') bondtall = bond.width();
				else if (settings.orientation == 'vert') bondtall = bond.height();
				
				/* Calculating the actual width of the slide show, it is the sum of all slides */
				box.children(settings.slideSelector).each(function() {
					if (settings.orientation == 'horz') {
						actualtall += $(this).width() + parseInt($(this).css('margin-left')) + parseInt($(this).css('margin-right'));
					}
					else if (settings.orientation == 'vert') {
						actualtall += $(this).height() + parseInt($(this).css('margin-top')) + parseInt($(this).css('margin-bottom'));
					}
				});
				
				/* Maximum out of bounds distance */
				var maxOut = Math.floor(Math.sqrt(actualtall)/2);
				
				function moveleft() {
					movestate = 'left';
					var left = parseInt(wrapper.css('left'));
					if (left > (bondtall - actualtall)) wrapper.css('left', left - scrollspeed + 'px');
					lefttime = setTimeout(moveleft, 10);
				}
				
				function moveright() {
					movestate = 'right';
					var left = parseInt(wrapper.css('left'));
					if (left < 0) wrapper.css('left', left + scrollspeed + 'px');
					righttime = setTimeout(moveright, 10);
				}
				
				function movetop() {
					movestate = 'top';
					var top = parseInt(wrapper.css('top'));
					if (top > (bondtall - actualtall)) wrapper.css('top', top - scrollspeed + 'px');
					toptime = setTimeout(movetop, 10);
				}
				
				function movebottom() {
					movestate = 'bottom';
					var top = parseInt(wrapper.css('top'));
					if (top < 0) wrapper.css('top', top + scrollspeed + 'px');
					bottomtime = setTimeout(movebottom, 10);
				}
				
				function motionengine(e) {
					if (settings.orientation == 'horz') motionengineH(e);
					else if (settings.orientation == 'vert') motionengineV(e);
				}
				
				function motionengineH(e) {
					var offset = bond.offset().left;
					var docx = $(document).scrollLeft();
					var	curpos = (window.event ? event.clientX : e.clientX ? e.clientX : '') - (offset - docx);
					var leftbound = (bondtall - settings.restArea)/2;
					var rightbound = (bondtall + settings.restArea)/2;
					
					if (curpos > rightbound) {
						scrollspeed = (curpos - rightbound)/leftbound * settings.maxSpeed;
						clearTimeout(righttime);
						if (movestate != 'left') moveleft();
					}
					else if (curpos < leftbound) {
						scrollspeed = (leftbound - curpos)/leftbound * settings.maxSpeed;
						clearTimeout(lefttime);
						if (movestate != 'right') moveright();
					}
					else scrollspeed = 0;
				}
				
				function motionengineV(e) {
					var offset = bond.offset().top;
					var docy = $(document).scrollTop();
					var	curpos = (window.event ? event.clientY : e.clientY ? e.clientY : '') - (offset - docy);
					var topbound = (bondtall - settings.restArea)/2;
					var bottombound = (bondtall + settings.restArea)/2;
					
					if (curpos > bottombound) {
						scrollspeed = (curpos - bottombound)/topbound * settings.maxSpeed;
						clearTimeout(bottomtime);
						if (movestate != 'top') movetop();
					}
					else if (curpos < topbound) {
						scrollspeed = (topbound - curpos)/topbound * settings.maxSpeed;
						clearTimeout(toptime);
						if (movestate != 'bottom') movebottom();
					}
					else scrollspeed = 0;
				}
				
				function stopmotion(e) {
					if (settings.orientation == 'horz') {
						clearTimeout(lefttime);
						clearTimeout(righttime);
					}
					else if (settings.orientation == 'vert') {
						clearTimeout(toptime);
						clearTimeout(bottomtime);
					}
					movestate = '';
				}
				
				function touchstart(e) {
					if (!isMobile && e.button == 2) return false;
					
					var moveEvent = (e.originalEvent && e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
					
					e.stopPropagation();
					
					delta = 0;
					velo = 0;

					switch (mode) {
						case 'css':
							wrapper.css({
								'-webkit-transition-duration': '0s',
								'-moz-transition-duration': '0s',
								'-o-transition-duration': '0s',
								'transition-duration': '0s'
							});
							if (settings.orientation == 'horz') touchstartPos = moveEvent.pageX - get3dCoord(0, wrapper);
							else if (settings.orientation == 'vert') touchstartPos = moveEvent.pageY - get3dCoord(1, wrapper);
						break;
						
						case 'margin':
							wrapper.stop();
							if (settings.orientation == 'horz') touchstartPos = moveEvent.pageX - parseFloat(wrapper.css('left'));
							else if (settings.orientation == 'vert') touchstartPos = moveEvent.pageY - parseFloat(wrapper.css('top'));
						break;
					}
					
					bond.bind('mousemove touchmove', function(e) { touchmove(e); });
					$(document).bind('mouseup touchend', function(e) { touchend(e); });
					
					return false;
				}
				
				function touchmove(e) {
					var moveEvent = (e.originalEvent && e.originalEvent.touches) ? e.originalEvent.touches[0] : e;
					
					e.preventDefault();
					e.stopPropagation();
					
					if (settings.orientation == 'horz') page = moveEvent.pageX;
					else if (settings.orientation == 'vert') page = moveEvent.pageY;
					
					velo = delta - (page - touchstartPos);
					delta = page - touchstartPos;
					
					var X = delta;
					
					if (delta > 0) 
						if (delta >= maxOut) X = Math.sqrt(delta - maxOut) * 10;
						else X = 0;
					else if (delta < -actualtall + bondtall)
						X = -actualtall + bondtall - Math.sqrt(Math.abs(Math.abs(delta + (actualtall - bondtall)))) * 10;
					
					switch (mode) {
						case 'css':
							if (settings.orientation == 'horz') wrapper.css({
								'-webkit-transform': 'translate3d(' + X + 'px, 0px, 0px)',
								'-moz-transform': 'translate3d(' + X + 'px, 0px, 0px)',
								'-o-transform': 'translate3d(' + X + 'px, 0px, 0px)',
								'transform': 'translate3d(' + X + 'px, 0px, 0px)'
							});
							else if (settings.orientation == 'vert') wrapper.css({
								'-webkit-transform': 'translate3d(0px, ' + X + 'px, 0px)',
								'-moz-transform': 'translate3d(0px, ' + X + 'px, 0px)',
								'-o-transform': 'translate3d(0px, ' + X + 'px, 0px)',
								'transform': 'translate3d(0px, ' + X + 'px, 0px)'
							});
						break;
						
						case 'margin':
							if (settings.orientation == 'horz') wrapper.css('left', X);
							else if (settings.orientation == 'vert') wrapper.css('top', X);
						break;
					}
					
					return false;
				}
				
				function touchend(e) {
					if (Math.abs(velo) > settings.maxVelocity) {
						switch (mode) {
							case 'css':
								if (settings.orientation == 'horz') coord = get3dCoord(0, wrapper);
								else if (settings.orientation == 'vert') coord = get3dCoord(1, wrapper);
							break;
							
							case 'margin':
								if (settings.orientation == 'horz') coord = parseFloat(wrapper.css('left'));
								else if (settings.orientation == 'vert') coord = parseFloat(wrapper.css('top'));
							break;
						}
						
						var out = Math.floor(coord - Math.sqrt(Math.abs(velo)) * 100 * velo/Math.abs(velo));
						var time = settings.timeScroll;
						
						if (out > 0) { 
							out = maxOut * settings.bounce; 
							time = settings.timeBounce;
						}
						else if (out < -actualtall + bondtall) {
							out = -actualtall + bondtall - maxOut * settings.bounce;
							time = settings.timeBounce;
						}
						else {
							time = settings.timeScroll;
						}
						
						switch (mode) {
							case 'css':
								wrapper.css({
									'-webkit-transition-timing-function': settings.easingCss,
									'-webkit-transition-duration': time,
									'-moz-transition-timing-function': settings.easingCss,
									'-moz-transition-duration': time,
									'-o-transition-timing-function': settings.easingCss,
									'-o-transition-duration': time,
									'transition-timing-function': settings.easingCss,
									'transition-duration': time
								});
								if (settings.orientation == 'horz') wrapper.css({
									'-webkit-transform': 'translate3d(' + out + 'px, 0px, 0px)',
									'-moz-transform': 'translate3d(' + out + 'px, 0px, 0px)',
									'-o-transform': 'translate3d(' + out + 'px, 0px, 0px)',
									'transform': 'translate3d(' + out + 'px, 0px, 0px)'
								});
								else if (settings.orientation == 'vert') wrapper.css({
									'-webkit-transform': 'translate3d(0px, ' + out + 'px, 0px)',
									'-moz-transform': 'translate3d(0px, ' + out + 'px, 0px)',
									'-o-transform': 'translate3d(0px, ' + out + 'px, 0px)',
									'transform': 'translate3d(0px, ' + out + 'px, 0px)'
								});
								wrapper.bind('webkitTransitionEnd mozTransitionEnd oTransitionEnd transitionEnd', slideback);
							break;
							
							case 'margin':
								if (settings.orientation == 'horz') 
									wrapper.animate({left: out}, parseFloat(time) * 1000, settings.easingMargin, slideback);
								else if (settings.orientation == 'vert')
									wrapper.animate({top: out}, parseFloat(time) * 1000, settings.easingMargin, slideback);
							break;
						}
					} else slideback();
					
					
					bond.unbind('mousemove touchmove');
					$(document).unbind('mouseup touchend');
					
					return false;
				}
				
				function slideback() {
					switch (mode) {
						case 'css':
							if (settings.orientation == 'horz') out = get3dCoord(0, wrapper);
							else if (settings.orientation == 'vert') out = get3dCoord(1, wrapper);
						break;
						
						case 'margin':
							if (settings.orientation == 'horz') out = parseFloat(wrapper.css('left'));
							else if (settings.orientation == 'vert') out = parseFloat(wrapper.css('top'));
						break;
					}
					
					if (out > 0) {
						if (out > maxOut) out = maxOut;
						switch (mode) {
							case 'css':
								wrapper.css({
									'-webkit-transform': 'translate3d(0px, 0px, 0px)',
									'-moz-transform': 'translate3d(0px, 0px, 0px)',
									'-o-transform': 'translate3d(0px, 0px, 0px)',
									'transform': 'translate3d(0px, 0px, 0px)'
								});
							break;
							
							case 'margin':
								wrapper.animate({left: 0, top: 0}, parseFloat(settings.timeBack) * 1000, settings.easingMargin);
							break;
						}
					}
					else if (out < -actualtall + bondtall) {
						if (Math.abs(out - actualtall) > maxOut) out = -actualtall - settings.maxOut;
						var X = (actualtall - bondtall).toString();
						
						switch (mode) {
							case 'css':
								if (settings.orientation == 'horz') wrapper.css({
									'-webkit-transform': 'translate3d(-' + X + 'px, 0px, 0px)',
									'-moz-transform': 'translate3d(-' + X + 'px, 0px, 0px)',
									'-o-transform': 'translate3d(-' + X + 'px, 0px, 0px)',
									'transform': 'translate3d(-' + X + 'px, 0px, 0px)'
								});
								else if (settings.orientation == 'vert') wrapper.css({
									'-webkit-transform': 'translate3d(0px, -' + X + 'px, 0px)',
									'-moz-transform': 'translate3d(0px, -' + X + 'px, 0px)',
									'-o-transform': 'translate3d(0px, -' + X + 'px, 0px)',
									'transform': 'translate3d(0px, -' + X + 'px, 0px)'
								});
							break;
							
							case 'margin':
								if (settings.orientation == 'horz')
									wrapper.animate({'left': -X}, parseFloat(settings.timeBack) * 1000, settings.easingMargin);
								else if (settings.orientation == 'vert')
									wrapper.animate({'top': -X}, parseFloat(settings.timeBack) * 1000, settings.easingMargin);
							break;
						}
					}
					
					if (mode == 'css') {
						wrapper.css({
							'-webkit-transition-timing-function': settings.easingCss,
							'-webkit-transition-duration': settings.timeBack,
							'-moz-transition-timing-function': settings.easingCss,
							'-moz-transition-duration': settings.timeBack,
							'-o-transition-timing-function': settings.easingCss,
							'-o-transition-duration': settings.timeBack,
							'transition-timing-function': settings.easingCss,
							'transition-duration': settings.timeBack
						});
					}
				}
				
				switch (isMobile) {
					case false:
						switch (settings.desktopMode) {
							case 'move':
								mode = 'move';
								bond.bind('mousemove', function(e){ motionengine(e); });
								bond.bind('mouseleave', function(e){ stopmotion(e); });
							break;
							
							case 'touchCss':
								mode = 'css';
								bond.bind('mousedown touchstart', function(e) { touchstart(e); });
								wrapper.bind('mousedown', function(e) { e.preventDefault(); touchstart(e); });
								bond.find('a').bind('click', function(e) { if (delta != 0) return false; });
							break;
							
							case 'touchMargin':
								mode = 'margin';
								bond.bind('mousedown touchstart', function(e) { touchstart(e); });
								wrapper.bind('mousedown', function(e) { e.preventDefault(); touchstart(e); });
								bond.find('a').bind('click', function(e) { if (delta != 0) return false; });
							break;
						}
					break;
					
					case true:
						switch (settings.mobileMode) {
							case 'touchCss':
								mode = 'css';
								bond.bind('mousedown touchstart', function(e) { touchstart(e); });
								bond.find('a').bind('click', function(e) { if (delta != 0) return false; });
							break;
							
							case 'touchMargin':
								mode = 'margin';
								bond.bind('mousedown touchstart', function(e) { touchstart(e); });
								bond.find('a').bind('click', function(e) { if (delta != 0) return false; });
							break;
						}
					break;
				}
				
				/* Setting startup position */
				if (settings.startPos != 0) var startShift = ((bondtall - actualtall)/settings.startPos).toString();
				else var startShift = 0;

				switch (mode) {
					case 'css':
						switch (settings.orientation) {
							case 'horz':
								wrapper.css({
									'-webkit-transform': 'translate3d(' + startShift + 'px, 0px, 0px)',
									'-moz-transform': 'translate3d(' + startShift + 'px, 0px, 0px)',
									'-o-transform': 'translate3d(' + startShift + 'px, 0px, 0px)',
									'transform': 'translate3d(' + startShift + 'px, 0px, 0px)'
								});
							break;
							
							case 'vert':
								wrapper.css({
									'-webkit-transform': 'translate3d(0px, ' + startShift + 'px, 0px)',
									'-moz-transform': 'translate3d(0px, ' + startShift + 'px, 0px)',
									'-o-transform': 'translate3d(0px, ' + startShift + 'px, 0px)',
									'transform': 'translate3d(0px, ' + startShift + 'px, 0px)'
								});
							break;
						}
					break;
					
					case 'move':
					case 'margin':
						switch (settings.orientation) {
							case 'horz':
								wrapper.css('left', startShift + 'px');
							break;
							
							case 'vert':
								wrapper.css('top', startShift + 'px');
							break;
						}
					break;
				}
				
				box.children(settings.slideSelector).click(function() {
					N = box.children(settings.slideSelector).index(this);
					settings.slideClickCallback(N, delta);
				});
			});
		}
	});
})(jQuery);