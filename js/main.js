(function (window) {
  'use strict';

  function createSalesman () {
    var parent = document.querySelector('#secondPage ul.secondPage-slideshow');
    var slideshow;
    var openProtocolBtn = document.querySelector('#openProtocolExample');
    var bbox = openProtocolBtn.getBoundingClientRect();

    var secondPage = document.querySelector('#secondPage');
    secondPage.style.left = 0;
    secondPage.style.top = 0;
    secondPage.style.width = '100%';
    secondPage.style.height = '100%';

    // var nav = document.querySelector('#secondPage ul.secondPage-nav');
    var nav;
    slideshow = new ProtocolSlideshow(parent, nav);

    secondPage.style.left = bbox.left + 'px';
    secondPage.style.top = bbox.top + 'px';
    secondPage.style.width = bbox.width + 'px';
    secondPage.style.height = bbox.height + 'px';

    var closeProtocolBtnID = 'closeProtocolExample';
    var closeProtocolBtn = document.getElementById(closeProtocolBtnID);
    var secondPageBodyClass = 'secondPage';
    function toggle() {
      var isOpen = classie.has(document.body, secondPageBodyClass);
      if (isOpen === true) {
        slideshow.stop();
        classie.remove(document.body, secondPageBodyClass);
        closeProtocolBtn.removeEventListener('click', toggle);
        setTimeout(function () {
          secondPage.addEventListener('click', toggle, false);
        }, 200);
      } else {
        classie.add(document.body, secondPageBodyClass);
        setTimeout(function () {
          slideshow.play();
          closeProtocolBtn.addEventListener('click', toggle, false);
        }, 200);
        secondPage.removeEventListener('click', toggle);
      }
    };
    secondPage.addEventListener('click', toggle, false);
  }

  function createMain() {
    var parent = document.querySelector('#firstPage ul.firstPage-main-slideshow');
    var slideshow = new TangleSlideshow(parent);
  }


  window.createSalesman = createSalesman;
  window.createMain = createMain;
})(window);