/// <reference path="../typings/tsd.d.ts" />

(function main(BezierEasing) {
  if (arguments.length === 0) {
  // If running in Node.js
    if (Function('return this.isNode;')()) {
      BezierEasing = require('bezier-easing');
      module.exports = main(BezierEasing);
      return;
    }
    else { // Running in Browser
      define(['bezier-easing'], main);
      return;
    }
  }

  var Slide = function Slide(settings) {
    // interface check
    if (!settings.canvas || !settings.canvas.getContext) {
      throw new Error('Slide: canvas not found!');
    }
    if (!settings.images || settings.images.length < 1) {
      throw new Error('Slide: at least 1 image needed.');
    }
    // public
    this.images = settings.images;
    this.canvas = settings.canvas;
    this.animationTime = settings.animationTime || 1000;
    this.slideTime = settings.slideTime || 5000;
    this.width = this.canvas.width = settings.width || this.canvas.width || 500;
    this.height = this.canvas.height = settings.height || this.canvas.height || 500;
    this.timing = (settings.timing && BezierEasing(settings.timing)) || BezierEasing.ease;
    this.random = settings.random || false;
    this.showProgress = settings.showProgress || false;
    // private
    this._index = [0, this.random ? Math.floor(Math.random() * this.images.length) : 0];
    this._rad = 15;
    this._ctx = settings.canvas.getContext('2d');
    this._emptyImage = new Image();
    //setup
    this._emptyImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAADklEQVQYlWNgGAWDEwAAAZoAARbK02kAAAAASUVORK5CYII=';
    this._emptyImage.width = 10;
    this._emptyImage.height = 10;
  };

  Slide.prototype._clearCanvas = function clearCanvas() {
    this._ctx.clearRect(0, 0, this.width, this.height);
  };

  /**
   * _draw(currentImgWidth, currentImgHeight, currentImgElement)
   * OR
   * _draw(currentImgWidth, currentImgHeight, currentImgElement,
   *       newImgWidth,     newImgHeight,     newImgElement,
   *       timePercent)
   */
  Slide.prototype._drawImg = function drawImg(imgc, imgn, t) {
    var canvasRatio = this.width / this.height;
    var srcX;
    var srcY;
    var srcW;
    var srcH;
    var destX = 0;
    var destY = 0;
    var destW = this.width;
    var destH = this.height;

    if (imgc.ratio < canvasRatio) {
      destY = -(this.width / imgc.ratio - this.height) / 2;
      destH = this.width / imgc.ratio;
    }
    else {
      destX = -(this.height * imgc.ratio - this.width) / 2;
      destW = this.height * imgc.ratio;
    }

    this._ctx.drawImage(imgc.element, destX, destY, destW, destH);

    if (t > 0) {
      srcX = 0;
      srcY = 0;
      srcW = imgn.width;
      srcH = imgn.height;

      if (imgn.ratio < canvasRatio) {
        srcY = (imgn.height - imgn.width / canvasRatio) / 2;
        srcH = imgn.width / canvasRatio;
      }
      else {
        srcX = (imgn.width - imgn.height * canvasRatio) / 2;
        srcW = imgn.height * canvasRatio;
      }

      this._ctx.drawImage(imgn.element, srcX, srcY, srcW * this.timing.get(t), srcH, 0, 0, this.width * this.timing.get(t), this.height);
    }
  };

  Slide.prototype._drawProgress = function drawProgress(t) {
    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this._ctx.fillRect(this.width - this._rad * 3.5, this._rad * 0.5, this._rad * 3, this._rad * 3);

    this._ctx.beginPath();
    this._ctx.arc(this.width - this._rad * 2, this._rad * 2, this._rad, 0 - Math.PI  / 2, Math.PI * 2 * t - Math.PI / 2);
    this._ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    this._ctx.lineWidth = this._rad * 0.4;
    this._ctx.stroke();
    this._ctx.closePath();

    this._ctx.textAlign = 'center';
    this._ctx.textBaseline = 'middle';
    this._ctx.font = '300 ' + this._rad * 1 + 'px sans-serif';
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    this._ctx.fillText(this._index[1] + 1, this.width - this._rad * 2, this._rad * 2);
  };

  /**
   * Animation and time control
   */
  Slide.prototype._step = function step(imgc, imgn, now) {
    if (now - this._lastRun < this.slideTime) {
      if (this.showProgress) this._ctx.clearRect(this.width - this._rad * 4, 0, this._rad * 4, this._rad * 4);

      if (now - this._lastRun < this.animationTime) {
        this._drawImg(imgc, imgn, (now - this._lastRun) / this.animationTime);
      }
      else {
        this._drawImg(imgn);
      }
      if (this.showProgress) this._drawProgress((now - this._lastRun) / this.slideTime);
      this._requestAniID = requestAnimationFrame(step.bind(this, imgc, imgn));
      return;
    }

    this.next();
  };

  Slide.prototype.next = function next() {
    var imgc, imgn;

    this._index = [this._index[1], (function nextImgIndex(r, l, random) {
      var next;
      if (random && l >= 2) do next = Math.floor(Math.random() * l); while (next === r);
      else next = (r + 1) % l;
      return next;
    }(this._index[1], this.images.length, this.random))];

    imgc = this.images[this._index[0]];
    imgn = this.images[this._index[1]];

    this._lastRun = performance.now();
    this._step({
        'width': imgc.width,
        'height': imgc.height,
        'ratio': imgc.width / imgc.height,
        'element': imgc
    }, {
      'width': imgn.width,
      'height': imgn.height,
      'ratio': imgn.width / imgn.height,
      'element': imgn
    }, this._lastRun);
  };

  Slide.prototype.start = function start() {
    var imgn;

    imgn = this.images[this._index[1]];
    this.stop();
    this._lastRun = performance.now();
    this._step({
      'width': this._emptyImage.width,
      'height': this._emptyImage.height,
      'ratio': this._emptyImage.width / this._emptyImage.height,
      'element': this._emptyImage
    }, {
      'width': imgn.width,
      'height': imgn.height,
      'ratio': imgn.width / imgn.height,
      'element': imgn
    }, this._lastRun);
  };

  Slide.prototype.stop = function stop() {
    if (this._requestAniID) {
      cancelAnimationFrame(this._requestAniID);
      this._requestAniID = null;
    }
    this._lastRun = null;
    this._clearCanvas();
  };

  Slide.prototype.resize = function resize(width, height) {
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
  };

  if (typeof window === 'object') window.Slide = Slide;
  return Slide;
}());