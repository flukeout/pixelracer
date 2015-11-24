window.startEditor = function () {
  var inspector = document.querySelector('#inspector');
  var cursor = document.querySelector('#track-editor-cursor');
  var cursorCube = cursor.querySelector('.cube');
  var skidCanvas = document.querySelector('canvas.skids');

  cursor.classList.add('show');
  inspector.classList.add('show');

  skidCanvas.onmousemove = function (e) {
    var fixX = Math.round(e.offsetX/15) * 15;
    var fixY = Math.round(e.offsetY/15) * 15;
    var px = fixX/15;
    var py = fixY/15;
    var mapType = checkPosition(px, py) || '[none]';
    cursorCube.style.transform = 'translate3d(' + fixX + 'px, ' + fixY + 'px, 7px)';
    inspector.innerText = 'P: ' + px + ',' + py + ' => ' + mapType + '';
    console.log();
  };
};