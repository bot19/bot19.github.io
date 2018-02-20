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
			windowTopPosition: $window.scrollTop(),
			scrollHeaderOffsent: 100,
			headerTransHeight: 200
		},
		website = {
			init: function () {	
				var
					$timerHr = $('#hour'),
					$timerMin = $('#mins'),
					$timerDay = $('#day'),
					$timerYear = $('#year'),
					$header = $('#fn-header'),
					$progressBar = $('#fn-progress');

				/*
					UTILITY FUNCTIONS
				*/
				// doOnce plugin; execute if element exists
				jQuery.fn.doOnce = function( func ) {
					this.length && func.apply( this );
					return this;
				};

				/*
					Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be called after it stops being called for N milliseconds. If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
					http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed
				*/
				var debounce = function (func, wait, immediate) {	
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

				// Array shuffling prototype
				Array.prototype.shuffle = function(){
					var counter = this.length, temp, index;
					
					// While there are elements in the array
					while (counter > 0) {
						// Pick a random index
						index = (Math.random() * counter--) | 0;
						
						// And swap the last element with it
						temp = this[counter];
						this[counter] = this[index];
						this[index] = temp;
					}
				};

				/*
					CUSTOM FUNCTIONS
				*/
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

				// cover down arrow (smooth) scroll to content
				var contentScroll = function () {
					this.on('click', function(ev) {
						console.log('contentScroll init', this);
						ev.preventDefault();

						var
							// target element id
							id = $(this).data('target'),
							$id = $(id),
							// top position relative to the document
							pos = $id.offset().top;

						// animated top scrolling (-px for fixed nav header)
						$('body, html').animate({scrollTop: pos - variables.scrollHeaderOffsent}, 1000);
					});
				};

				/** 
				 * SETTIMER functionaliy
				 * using real time difference to generate blog time
				 * diff: now vs start date (1 May 2017, arrive KR)
				 * 1 real day is 1 blog year
				 * 24 real hours is 365 blog days
				*/
				var setTimer = function () {
					var
						initDate = [2017, 5, 1], // init date
						timeDiffDays = moment().diff(moment(initDate), 'days'),
						timeDiffMins = moment().diff(moment(initDate), 'minutes'),
						hrToBlogDays = ((timeDiffMins / 24 / 60) - timeDiffDays) * 365,
						blogDays = Math.floor(hrToBlogDays),
						partBlogDaysToBlogHr = null;
					
					// set blog day (hr) and blog year (day)
					$timerYear.html(timeDiffDays);
					$timerDay.html(blogDays); // round down, decimal used for hours
					
					// set blog hour
					partBlogDaysToBlogHr = Math.round(hrToBlogDays % 1 * 24);
					$timerHr.html(partBlogDaysToBlogHr.toLocaleString(undefined,{minimumIntegerDigits: 2}));

					console.log('setTimer:', hrToBlogDays, hrToBlogDays % 1, hrToBlogDays % 1 * 24, partBlogDaysToBlogHr);

					// start the timer
					startTimer(partBlogDaysToBlogHr, blogDays);
				};

				/** 
				 * SECTIMER functionaliy
				 * ticks up blog minutes
				*/
				var secTimer = function (updateBlogMinInterval) {
					var
						blogMins = 0,
						increaesBlogMins = function () {
							blogMins += 1;
							
							if (blogMins > 59) {
								//console.log('increaesBlogMins interval cleared');
								clearInterval(blogMinInterval);
							}
							
							$timerMin.html(blogMins.toLocaleString(undefined,{minimumIntegerDigits: 2}));
						},
						blogMinInterval = setInterval(increaesBlogMins, updateBlogMinInterval);
				};

				/** 
				 * STARTTIMER functionaliy
				 * ticks up blog hours + check blog days / year
				 * inactive tab causes setIntervals to go wonky
				 * upon active tab, eventually setIntervals will correct
				*/
				var startTimer = function (partBlogDaysToBlogHr, blogDays) {
					// timing to increase blog hour
					// real mins/day by 365 blog days: 24 * 60 / 365 (min/blog day)
					// above * 60 (sec) / 24 (h) = blog hr update every real sec (rate)
					// below calculation is simplified. Removed 24/24.
					var
						realMinuteToBlogDay = 60 / 365 * 60,
						updateBlogHrInterval = realMinuteToBlogDay * 1000,
						updateBlogMinInterval = updateBlogHrInterval / 60,
						blogHrInterval = null;

					// blog minutes counter first start
					secTimer(updateBlogMinInterval);
					
					// increase blog hour + update year every 24 blog hr (~4m real)
					blogHrInterval = setInterval(function () {
						partBlogDaysToBlogHr += 1;
						
						// reset blog mins counter + start again
						secTimer(updateBlogMinInterval);

						// 24h > updated blog day
						if (partBlogDaysToBlogHr > 23) {
							$timerDay.html(blogDays += 1);
							partBlogDaysToBlogHr = 0;
						}

						// at day 365, trigger moment.js to update day, year + reset hr to 0
						if (blogDays > 364) {
							// kill previous hr+ interval
							clearInterval(blogHrInterval);
							// set the timer + start it again
							return setTimer();
						}
						
						// all good? Set the blog hour
						$timerHr.html(partBlogDaysToBlogHr.toLocaleString(undefined,{minimumIntegerDigits: 2}));
						//console.log('inside interval');
					}, updateBlogHrInterval);

					//console.log('startTimer');
				};

				// header scroll transition
				var transitionHeader = function (window_top_position) {
					console.log('transitionHeader init');

					var
						headerAnimationClass = 'header-page',
						progressAnimationClass = 'an-opacity-1';

					if (window_top_position > variables.headerTransHeight) {
						// cover header > page header
						$header.addClass(headerAnimationClass);
						$progressBar.addClass(progressAnimationClass);
					} else {
						// page header > cover header
						$header.removeClass(headerAnimationClass);
						$progressBar.removeClass(progressAnimationClass);
					}
				};

				// landing cover heading animation
				var landingCoverHeading = function () {
					var
					$heading = this,
					headingArray = null,
					char = null,
					$char = null,
					headingInterval = null;
					
					// get heading letters into array
					headingArray = $heading.text();
					headingArray = headingArray.trim().split('');
					
					// shuffle array
					headingArray.shuffle();
					console.log('landingCoverHeading init', headingArray);
					
					// first array letter show and remove from array
					headingInterval = setInterval(function () {
						char = headingArray.shift(); // return + remove first array item
						char = char === '#' ? 'hash' : char; // change # to 'hash'
						// find character and show
						$char = $heading.children('.char-hidden.char-' + char).first();
						$char.removeClass('char-hidden');
						
						console.log('headingInterval', $char, headingArray.length);
						
						if (headingArray.length === 0) {
							clearInterval(headingInterval);
							// on complete, (call function to) loop through words
						}
					}, 300);
				};



				/*
					ON LOAD execute
				*/
				// GLOBAL
				//urlAnchor();
				setTimer();
				transitionHeader(variables.windowTopPosition);


				// PARTICULAR PAGE
				$('#fn-down').doOnce(contentScroll);
				$('#fn-down-bar').doOnce(contentScroll);
				$('#fn-lcover-heading').doOnce(landingCoverHeading);


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
					variables.windowTopPosition = $window.scrollTop();

					// GLOBAL
					transitionHeader(variables.windowTopPosition);


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









