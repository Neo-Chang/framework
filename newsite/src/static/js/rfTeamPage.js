$(function () {


  var isTouch = 'ontouchstart' in document.documentElement;

  if(!isTouch) {
    $(".team-avatar").hover(function() {
      $(this).find(".info").stop().slideDown();
    }, function() {
      $(this).find(".info").stop().slideUp();
    });
  }

});
