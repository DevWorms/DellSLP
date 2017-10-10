/**
 * @autor: https://www.newventuresoftware.com/blog/CSS-animations-triggered-when-elements-are-visible-on-screen
 */
(function ($, window, document, undefined) {
    'use strict';
    var animationObject;

    function nvsAddAnimation() {
        animationObject.each(function (index, element) {
            var $currentElement = $(element),
                animationType = $currentElement.attr('nvs-animation-type');

            if (nvsOnScreen($currentElement)) {
                $currentElement.css({ 'visibility': 'visible' });
                $currentElement.addClass('animated ' + animationType);
            }
        });
    }

    // takes jQuery(element) a.k.a. $('element')
    function nvsOnScreen(element) {
        // window bottom edge
        var windowBottomEdge = $(window).scrollTop() + $(window).height();

        // element top edge
        var elementTopEdge = element.offset().top;
        var offset = 100;

        // if element is between window's top and bottom edges
        return elementTopEdge + offset <= windowBottomEdge;
    }

    $(document).on('ready', function () {
        animationObject = $('[nvs-animation-type]');
        nvsAddAnimation();
    });

    $(window).on('scroll', function (e) {
        nvsAddAnimation();
    });
}(jQuery, window, document));