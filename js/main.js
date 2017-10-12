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

    secondPage.style.left = bbox.x + 'px';
    secondPage.style.top = bbox.y + 'px';
    secondPage.style.width = bbox.width + 'px';
    secondPage.style.height = bbox.height + 'px';

    var isOpen = false;
    var closeProtocolBtnID = 'closeProtocolExample';
    var closeProtocolBtn = document.getElementById(closeProtocolBtnID);
    function toggle() {
      if (isOpen === true) {
        document.body.className = '';
        slideshow.stop();
        isOpen = false;
        closeProtocolBtn.removeEventListener('click', toggle);
        setTimeout(function () {
          secondPage.addEventListener('click', toggle);
        }, 200);
      } else {
        document.body.className = 'secondPage';
        setTimeout(function () {
          slideshow.play();
          closeProtocolBtn.addEventListener('click', toggle);
        }, 200);
        isOpen = true;
        secondPage.removeEventListener('click', toggle);
      }
    };
    secondPage.addEventListener('click', toggle);
  }

  function createMain() {
    var parent = document.querySelector('#firstPage ul.firstPage-main-slideshow');
    var slideshow = new TangleSlideshow(parent);
  }


  window.createSalesman = createSalesman;
  window.createMain = createMain;
})(window);