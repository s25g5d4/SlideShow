# SlideShow
Full window slideshow for web and [Electron](http://electron.atom.io/).
Check out my online [example](https://dl.dropboxusercontent.com/u/55351012/SlideShow/index.html)!

Disclaimer: I don't own any picture used in example, they were collected from
the Internet, mostly from pixiv and konachan.

# Technology
SlideShow uses

- [HTML5 canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement)
- [`requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/Window.requestAnimationFrame)
  for smooth animation
- [bezier-easing](https://github.com/gre/bezier-easing) for timing function
- [requireJS](http://requirejs.org/) for modularize (note requireJS doesn't
  capable with Electron, SlideShow use native `require()` instead)
- [async](https://github.com/caolan/async) for asynchronous loading pictures

and is capable with [Electron](http://electron.atom.io/), the cross platform
desktop environment for web technologies.

# Usage
rename `configs.sample.json` to `configs.json`, and configure as following:

```javascript
{
  // Pictures to slide on
  "images": [
    "pictures/1.jpg",
    "pictures/2.jpg"
  ],

  // Transition animation interval
  "animationTime": 1000,

  // Next picture interval
  "slideTime": 5000,

  // Cubic-Bezier timing function parameter,
  // see cubic-bezier(), timing-function, CSS
  "timing": [0.25, 0.1, 0.25, 1.0],

  // Randomize order
  "random": true,

  // Show progress circle and picture number
  "showProgress": true
}
```

It's pure static page, you can put it anywhere and open with browsers, or use
with Electron.

For Electron only, option `"imageDir": "pictures/"` can make SlideShow
automatically scan folder `pictures` and load all images without manually
adding them.
