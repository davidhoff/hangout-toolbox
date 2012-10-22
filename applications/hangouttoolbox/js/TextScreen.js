/**
 * Copyright (c) 2012 Allen "Prisoner" Firstenberg / prisoner.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License
 */

// Generated by CoffeeScript 1.3.1
(function() {
  var TextCanvas, TextScreen;

  TextScreen = (function() {

    TextScreen.name = 'TextScreen';

    function TextScreen(defaults) {
      var height, width, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      if (!(defaults != null)) {
        defaults = {};
      }
      width = (_ref = defaults.width) != null ? _ref : 320;
      height = (_ref1 = defaults.height) != null ? _ref1 : 180;
      $('body').append("<canvas id='backgroundCanvas' style='display:none;' width='640' height='360'>");
      $('body').append("<canvas id='textScreenCanvas' style='display:none;' width='" + width + "' height='" + height + "'>");
      $('body').append('<span id="textScreenWork">');
      this.textCanvas = new TextCanvas('#textScreenCanvas', '#textScreenWork');
      this.setBackground((_ref2 = defaults.background) != null ? _ref2 : 'blue');
      this.setFont((_ref3 = defaults.font) != null ? _ref3 : 'Arial Black');
      this.setTextAlign((_ref4 = defaults.textAlign) != null ? _ref4 : 'left');
      this.setVerticalAlign((_ref5 = defaults.verticalAlign) != null ? _ref5 : 'middle');
      this.showing = false;
      return;
    }

    TextScreen.prototype.show = function(text) {
      var imgUrl, scale;
      if (this.showing) {
        this.hide();
      }
      this.bigOverlay.setVisible(true);
      this.textCanvas.text(text);
      scale = this.textCanvas.canvas.width / 640;
      imgUrl = this.textCanvas.canvas.toDataURL('image/png');
      this.smallImage = gapi.hangout.av.effects.createImageResource(imgUrl);
      this.smallOverlay = this.smallImage.showOverlay({
        position: {
          x: 0,
          y: 0
        }
      });
      this.smallOverlay.setScale(scale, gapi.hangout.av.effects.ScaleReference.WIDTH);
      this.showing = true;
    };

    TextScreen.prototype.hide = function() {
      if (this.showing) {
        if (this.bigOverlay != null) {
          this.bigOverlay.setVisible(false);
        }
        if (this.smallOverlay != null) {
          this.smallOverlay.setVisible(false);
          this.smallOverlay = void 0;
          this.smallImage.dispose();
          this.smallImage = void 0;
        }
      }
      this.showing = false;
    };

    TextScreen.prototype.setBackground = function(bg) {
      var canvas, context, imageResource, imageUrl;
      if ((bg.toLowerCase().indexOf('http')) === 0) {
        imageUrl = bg;
      } else {
        canvas = $('#backgroundCanvas')[0];
        context = canvas.getContext('2d');
        context.fillStyle = bg;
        context.fillRect(0, 0, canvas.width, canvas.height);
        imageUrl = canvas.toDataURL('image/png');
      }
      imageResource = gapi.hangout.av.effects.createImageResource(imageUrl);
      this.bigOverlay = imageResource.createOverlay({
        position: {
          x: 0,
          y: 0
        }
      });
    };

    TextScreen.prototype.setFont = function(font) {
      this.textCanvas.style('font-family', font);
    };

    TextScreen.prototype.setTextAlign = function(align) {
      this.textCanvas.style('text-align', align);
    };

    TextScreen.prototype.setVerticalAlign = function(align) {
      this.textCanvas.style('vertical-align', align);
    };

    return TextScreen;

  })();

  window.TextScreen = TextScreen;

  TextCanvas = (function() {

    TextCanvas.name = 'TextCanvas';

    function TextCanvas(canvas, work) {
      this.whitespaceRE = new RegExp(' +');
      this.newlineRE = new RegExp("\\s*[\n\r]+\\s*", "gm");
      this.minSize = 1;
      if (typeof canvas === 'string') {
        this.canvas = $(canvas)[0];
      } else {
        this.canvas = canvas;
      }
      this.context = this.canvas.getContext('2d');
      if (typeof work === 'string') {
        this.work = $(work);
      } else {
        this.work = work;
      }
      this.workj = $(this.work);
      this.workj.html('&nbsp;');
      this.textValue = '';
      this.recomputeMetrics();
      return;
    }

    TextCanvas.prototype.recomputeMetrics = function() {
      var font, fontFamily, fontSize, textAlign, _ref;
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.lineHeight = this.work[0].offsetHeight;
      this.context.fillStyle = 'black';
      this.context.strokeStyle = 'black';
      this.context.lineWidth = 1;
      font = this.workj.css('font');
      fontSize = this.workj.css('font-size');
      fontFamily = this.workj.css('font-family');
      if (font === '' || !(font != null)) {
        font = "" + fontSize + " " + fontFamily;
      }
      this.context.font = font != null ? font : '12px Arial';
      textAlign = (_ref = this.workj.css('text-align')) != null ? _ref : 'center';
      this.context.textAlign = textAlign;
    };

    TextCanvas.prototype.redraw = function() {
      var co, currentLine, line, lineWidth, lines, newline, testLine, word, words, x, y, _i, _j, _len, _len1;
      lines = [];
      co = 0;
      words = this.textValue.split(this.whitespaceRE);
      currentLine = '';
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        testLine = currentLine.length === 0 ? word : currentLine + ' ' + word;
        lineWidth = (this.context.measureText(testLine)).width;
        newline = false;
        if (word === '\n') {
          newline = true;
          word = '';
        }
        if (lineWidth > this.width || newline) {
          lines[co] = currentLine;
          co++;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines[co] = currentLine;
      this.overflow = false;
      this.context.clearRect(0, 0, this.width, this.height);
      y = (function() {
        switch (this.workj.css('vertical-align')) {
          case 'baseline':
          case 'bottom':
          case 'text-bottom':
            return this.height - this.lineHeight * (lines.length - 1);
          case 'middle':
            return (this.height / 2) - (this.lineHeight * (lines.length - 1)) / 2;
          default:
            return this.lineHeight;
        }
      }).call(this);
      this.overflow = this.overflow || (y < this.lineHeight);
      for (_j = 0, _len1 = lines.length; _j < _len1; _j++) {
        line = lines[_j];
        x = (function() {
          switch (this.context.textAlign) {
            case 'center':
              return this.width / 2;
            case 'right':
              return this.width;
            default:
              return 0;
          }
        }).call(this);
        this.context.fillText(line, x, y);
        this.context.strokeText(line, x, y);
        y += this.lineHeight;
      }
      this.overflow = this.overflow || (y - this.lineHeight > this.height);
    };

    TextCanvas.prototype.style = function(property, value) {
      if (!(value != null)) {
        return this.workj.css(property);
      }
      this.workj.css(property, value);
      this.recomputeMetrics();
      this.redraw();
    };

    TextCanvas.prototype.adjustFontSizeDown = function(size) {
      while (this.overflow && size >= this.minSize) {
        size--;
        this.style('font-size', "" + size + "px");
      }
      return size;
    };

    TextCanvas.prototype.adjustFontSizeUp = function(size) {
      while (!this.overflow) {
        size++;
        this.style('font-size', "" + size + "px");
      }
      size = this.adjustFontSizeDown(size);
      return size;
    };

    TextCanvas.prototype.adjustFontSize = function(size) {
      var sizestr, sizeval;
      if (!(size != null) || size < this.minSize) {
        sizestr = this.style('font-size');
        sizeval = sizestr.substring(0, sizestr.length - 2);
        size = parseInt(sizeval, 10);
      }
      size = this.adjustFontSizeDown(size);
      size = this.adjustFontSizeUp(size);
      return size;
    };

    TextCanvas.prototype.text = function(textValue) {
      this.textValue = textValue.replace(this.newlineRE, ' \n ');
      this.adjustFontSize(0);
    };

    return TextCanvas;

  })();

}).call(this);
