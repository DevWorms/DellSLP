var videoHeaderContainer = $('#video_header_container');

$( document ).on( 'ready', taheroReady );

function taheroReady(){
	var fieldsOnlyDigits = $( 'input[data-format="only-digits"], text[data-format="only-digits"]' );
	var formRegistration = new FormValidate( document.getElementById('form_registration') );
	var videoHeaderImg = new Image();

	fieldsOnlyDigits.on('keypress', function(e){
		if( e.which != 37 && e.which != 38 || e.which != 39 && e.which != 40 ){
			var inputValue = event.which;
			var character = String.fromCharCode(inputValue);
			var pattern = new RegExp(/[0-9]/);

			character = character.toLowerCase();

			if( !pattern.test( character ) ){
				event.preventDefault();
			}
		}
	});

	fieldsOnlyDigits.on('change', function(e){
		this.value = formatOnlyDigits( this.value );
	});

	formRegistration.useAjax = true;
	formRegistration.onDone = function( data ){
		if( data.success ){
			$('.form-registration-title, .form-registration').addClass( 'hidden' );
			$('.form-success').removeClass( 'hidden' );
		}
	}

	videoHeaderContainer = $('#video_header_container');
	videoHeaderImg.onload = function(){
		var videoHeader = $('#video_header').vide({
			mp4: videoPath+'.mp4'
		}, {
			volume: 1,
			playbackRate: 1,
			muted: true,
			loop: true,
			autoplay: true,
			position: '50% 50%', // Similar to the CSS `background-position` property.
			posterType: 'detect', // Poster image type. "detect" — auto-detection; "none" — no poster; "jpg", "png", "gif",... - extensions.
			resizing: true, // Auto-resizing, read: https://github.com/VodkaBears/Vide#resizing
			bgColor: 'transparent', // Allow custom background-color for Vide div,
			className: '' // Add custom CSS class to Vide div
		});
		var isIOS = /iPad|iPhone|iPod/.test(navigator.platform);
		var top = videoHeaderContainer.position();

		top = top.top;

		if (isIOS) {
			var vide = $('#video_header').data('vide');
			var video = vide.getVideoObject();
			var canvasVideoAdded = false;
			var canvasVideo;

			video.setAttribute( 'id', 'vide_header_video' );

			canvasVideo = new CanvasVideoPlayer({
				videoSelector: '#vide_header_video',
				canvasSelector: '#video_header_canvas',
				timelineSelector: false,
				autoplay: true,
				makeLoop: true,
				pauseOnClick: false,
				audio: false
			});
		}else {
			// Use HTML5 video
			document.querySelectorAll('.video-header-canvas-container')[0].style.display = 'none';	
		} 

		videoHeaderContainer.attr('data-height', videoHeaderContainer.outerHeight());
		videoHeaderContainer.attr('data-top', top);

		parallaxScroll();
	};
	videoHeaderImg.src = document.getElementById('video_header_img').src;

	$(window).bind('scroll',function(e){
   		parallaxScroll();
   	});
}

function formatOnlyDigits(s){
	return s.replace(/[^0-9]/g,'');
};
 
function parallaxScroll(){
	var scrolledY = $(window).scrollTop();
	var height = parseInt( videoHeaderContainer.attr('data-height') );
	var top = parseInt( videoHeaderContainer.attr('data-top') );

	height = height - ( scrolledY * 0.7 );
	top = top - ( scrolledY * 0.3 );

	videoHeaderContainer.css({ 'height': height+'px', 'top': top+'px' });
}