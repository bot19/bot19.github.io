/* 
	main JS file

	- time to JS modulize this up!
	- please minify on production :)
*/

(function ($) {
	"use strict";

	var
		$document = $(document),
		$window = $(window),
		breakpoints = {
			tablet: 769,
			desktop: 1024,
			widescreen: 1216,
			fullhd: 1408
		},
		variables = {
			initViewportWidth: window.innerWidth,
			headerHeightTrigger: 100
		},
		website = {
			init: function () {	
				var
					$header = null;

				/*
					UTILITY FUNCTIONS
				*/
				jQuery.fn.doOnce = function( func ) {
					// doOnce plugin; execute if element exists
					this.length && func.apply( this );
					return this;
				}
				var debounce = function (func, wait, immediate) {
					/*
						Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be called after it stops being called for N milliseconds. If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
						http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed
					*/
					var timeout;
					return function() {
						var context = this, args = arguments;
						var later = function() {
							timeout = null;
							if (!immediate) func.apply(context, args);
						};
						var callNow = immediate && !timeout;
						clearTimeout(timeout);
						timeout = setTimeout(later, wait);
						if (callNow) func.apply(context, args);
					};
				};

				// desktop nav: disable dropdown anchor click
				var desktopNav = function () {
					$header.find('.fn-dropdown').on('click', function (e) {
						e.preventDefault();
					});
				};

				// mobile nav
				var mobileNav = function () {
					this.on('click', function () {
						$(this).toggleClass('fa-bars fa-times');
						$('#fn-mobmenu').toggleClass('fn-menu-active');
					});
				};

				// url anchor
				var urlAnchor = function () {
					var
						$elem = $('#lk-' + window.location.hash.replace('#', '')),
						fixedHeaderSpacing = 100;
					if($elem.length) {
						console.log('$elem: ', $elem);
						setTimeout(function () {
							$('body, html').animate({scrollTop: $elem.offset().top - fixedHeaderSpacing}, 1000);
						}, 500);
					}
				};


				/*
					ON LOAD execute
				*/
				// GLOBAL
				//desktopNav();
				//urlAnchor();
				$('#fn-mobnav').doOnce(mobileNav);


				// PARTICULAR PAGE



				/*
					ON WINDOW RESIZE execute
					* only fires X ms post resized
				*/
				var initPostResize = debounce(function() {
					// GLOBAL

					// PARTICULAR PAGE


					// IE11
					//if ($ie1011.length) {}

					console.log('resize completed');
				}, 100);
				$window.resize(initPostResize);


				/*
					ON WINDOW SCROLL execute
				*/
				$window.scroll(function() {
					// execute - can't debounce because func needs triggering at certain points
					// GLOBAL


					// PARTICULAR PAGE

				});
			},
			animation: function () {
				/*
					JS animations for tablet+ here
				*/


			},
			development: function () {
				/*
					tools for development only
				*/
				var devWidth = function () {
					var // document.body.clientWidth = VP width wihtout scrollbar
						width = window.innerWidth, // VP width with scrollbar
						bp = null;
					//console.log('fn-width: ', width);

					switch (true) {
						case width >= breakpoints.fullhd: // 1408
							bp = 'flhd';
							break;
						case width >= breakpoints.widescreen: // 1216
							bp = 'wdscr';
							break;
						case width >= breakpoints.desktop: // 1024
							bp = 'desk';
							break;
						case width >= breakpoints.tablet: // 769
							bp = 'tab';
							break;
						default:
							bp = 'mob';
					}

					$('#fn-width')
						.children('.fn-width__width').html(width).end()
						.children('.fn-width__bp').html(bp);
				};


				/*
					ON LOAD execute
				*/
				devWidth();


				/*
					ON WINDOW RESIZE execute
				*/
				$window.resize(function () {
					devWidth();
				});
			}
		};

	// execute code
	$document.ready(function(){
		console.info('scripts.js : operational!');
		
		// all website js functionality
		website.init();

		// animation js: only animate for tablets > desktop
		if (window.innerWidth >= breakpoints.tablet) {
			website.animation();
		}

		// helpful development / debug js
		website.development();
	});

})(jQuery, undefined);









