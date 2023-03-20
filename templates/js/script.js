$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    if (scroll > 0) {
      $(".navbar").addClass("transparent");
    } else {
      $(".navbar").removeClass("transparent");
    }
});
  