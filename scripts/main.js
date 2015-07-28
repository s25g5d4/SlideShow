/// <reference path="../typings/tsd.d.ts" />

(function main(configs, async, Slide) {
  if (arguments.length === 0) {
  // If running in Node.js
    if (Function('return this.isNode;')()) {
      configs = require('configs.json');
      async = require('async');
      Slide = require('scripts/Slide');

      if (configs.imageDir) {
        configs.images = require('fs').readdirSync(__dirname + '/../' + configs.imageDir).map(function map(e) {
          return configs.imageDir + '/' + e;
        });
      }
    }
    else { // Running in Browser
      requirejs(['json!../configs.json', 'async', 'slide'], main);
      return;
    }
  }

  (function loaded() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loaded);
      return;
    }

    var loadImg = function loadImg(item, callback) {
      var img = new Image();
      img.src = item;
      if (img.complete) {
        callback(null, img);
        return;
      }

      img.addEventListener('load', function onload(event) {
        callback(null, event.target);
      });
      img.addEventListener('error', function onerror(event) {
        console.log("onerror: Can't load image '" + event.target.src + "'");
        console.log(event);
        callback(null, event);
      });
    };

    var imgDone = function imgDone(err, results) {
      if (err) {
        console.log(err);
        return;
      }

      var canvas = document.querySelector('canvas');
      var images = results.filter(function filter(e) {
        if (e.type === 'error' || e.width === 0 || e.height === 0) return false;
        else return true;
      });
      var slide = new Slide({
        'images': images,
        'canvas': canvas,
        'animationTime': configs.animationTime,
        'slideTime': configs.slideTime,
        'width': window.innerWidth,
        'height': window.innerHeight,
        'timing': configs.timing,
        'random': configs.random,
        'showProgress': configs.showProgress
      });

      window.addEventListener('resize', function () {
        slide.resize(window.innerWidth, window.innerHeight);
      });
      slide.start();
    };

    async.map(configs.images, loadImg, imgDone);
  }());
}());