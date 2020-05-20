/*-------------------------------------------------------------------------------------------
 *
 *      Tooltip
 *
 * -----------------------------------------------------------------------------------------*/ 
(function ($, window) {
    "use strict";

    var $body,
    $tipper;

    /**
     * @options
     * @param direction [string] <'top'> "Tooltip direction"
     * @param follow [boolean] <false> "Flag to follow mouse"
     * @param formatter [function] <$.noop> "Text format function"
     * @param margin [int] <15> "Tooltip margin"
     */
    var options = {
        direction: "top",
        follow: false,
        formatter: $.noop,
        margin: 15
    };

    var pub = {

        /**
         * @method
         * @name defaults
         * @description Sets default plugin options
         * @param opts [object] <{}> "Options object"
         * @example $.tipper("defaults", opts);
         */
        defaults: function (opts) {
            options = $.extend(options, opts || {});
            return $(this);
        },

        /**
         * @method
         * @name destroy
         * @description Removes instance of plugin
         * @example $(".target").tipper("destroy");
         */
        destroy: function () {
            return $(this).trigger("mouseleave.tipper")
                .off(".tipper")
                .removeClass("tipper-attached");
        }
    };


    /**
     * @method private
     * @name _init
     * @description Initializes plugin
     * @param opts [object] "Initialization options"
     */
    function _init(opts) {
        options.formatter = _format;
        return $(this).not(".tipper-attached")
            .addClass("tipper-attached")
            .on("mouseenter.tipper", $.extend({}, options, opts || {}), _build);
    }

    /**
     * @method private
     * @name _build
     * @description Builds target instance
     * @param e [object] "Event data"
     */
    function _build(e) {
        $body = $("body");

        var $target = $(this),
            data = $.extend(true, {}, e.data, $target.data("tipper-options")),
            html = '';

        html += '<div class="tipper ' + data.direction + '">';
        html += '<div class="tipper-content">';
        html += data.formatter.apply($body, [$target]);
        html += '<span class="tipper-caret"</span>';
        html += '</div>';
        html += '</div>';

        data.$target = $target;
        data.$tipper = $(html);

        $body.append(data.$tipper);

        data.$content = data.$tipper.find(".tipper-content");
        data.$caret = data.$tipper.find(".tipper-caret");
        data.offset = $target.offset();
        data.height = $target.outerHeight();
        data.width = $target.outerWidth();

        data.tipperPos = {};
        data.caretPos = {};
        data.contentPos = {};

        var caretHeight = data.$caret.outerHeight(true),
            caretWidth = data.$caret.outerWidth(true),
            contentHeight = data.$content.outerHeight(true),
            contentWidth = data.$content.outerWidth(true) + caretWidth;

        // position content
        if (data.direction === "right" || data.direction === "left") {
            data.caretPos.top = (contentHeight - caretHeight) / 2;
            data.contentPos.top = -contentHeight / 2;
            if (data.direction === "right") {
                data.contentPos.left = caretWidth + data.margin;
            } else if (data.direction === "left") {
                data.contentPos.left = -(contentWidth + data.margin);
            }
        } else {
            data.caretPos.left = (contentWidth - caretWidth) / 2;
            data.contentPos.left = -contentWidth / 2;

            if (data.direction === "bottom") {
                data.contentPos.top = data.margin;
            } else if (data.direction === "top") {
                data.contentPos.top = -(contentHeight + data.margin);
            }
        }

        // modify dom
        data.$content.css(data.contentPos);
        data.$caret.css(data.caretPos);

        // Position tipper
        if (data.follow) {
            data.$target.on("mousemove.tipper", data, _onMouseMove)
                .trigger("mousemove");
        } else {
            if (data.direction === "right" || data.direction === "left") {
                data.tipperPos.top = data.offset.top + (data.height / 2);
                if (data.direction === "right") {
                    data.tipperPos.left = data.offset.left + data.width;
                } else if (data.direction === "left") {
                    data.tipperPos.left = data.offset.left;
                }
            } else {
                data.tipperPos.left = data.offset.left + (data.width / 2);
                if (data.direction === "bottom") {
                    data.tipperPos.top = data.offset.top + data.height;
                } else if (data.direction === "top") {
                    data.tipperPos.top = data.offset.top;
                }
            }

            data.$tipper.css(data.tipperPos);
        }

        // Bind events
        data.$target.one("mouseleave.tipper", data, _onMouseOut);
    }

    /**
     * @method private
     * @name _format
     * @description Formats tooltip text
     * @param $target [jQuery object] "Target element"
     * @return [string] "Formatted text"
     */
    function _format($target) {
        return $target.data("title");
    }

    /**
     * @method private
     * @name _onMouseMove
     * @description Handles mousemove event
     * @param e [object] "Event data"
     */
    function _onMouseMove(e) {
        var data = e.data;

        data.$tipper.css({
            left: e.pageX,
            top: e.pageY
        });
    }

    /**
     * @method private
     * @name _onMouseOut
     * @description Handles mouseout event
     * @param e [object] "Event data"
     */
    function _onMouseOut(e) {
        var data = e.data;

        data.$tipper.remove();
        data.$target.off("mousemove.tipper mouseleave.tipper");
    }

    $.fn.tipper = function (method) {
        if (pub[method]) {
            return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return _init.apply(this, arguments);
        }
        return this;
    };

    $.tipper = function (method) {
        if (method === "defaults") {
            pub.defaults.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    };
})(jQuery);

$(function(){
    $('td').each(function () {
        var $this = $(this);
        if (this.offsetWidth < this.scrollWidth) {
            var text = $this.text();
            $this.attr("data-title", text);
            $this.tipper({
                direction: "bottom",
                follow: true
            });
        }
    });
})




var needle;

var createGauge = function(){

var barWidth, chart, chartInset, degToRad, repaintGauge,
    height, margin, numSections, padRad, percToDeg, percToRad, 
    percent, radius, sectionIndx, svg, totalPercent, width;

  percent = .65;
  numSections = 1;
  sectionPerc = 1 / numSections / 2;
  padRad = 0.025;
  chartInset = 10;

  // Orientation of gauge:
  totalPercent = .75;

  el = d3.select('.chart-gauge');

  margin = {
    top: 15,
    right: 0,
    bottom: 0,
    left: 0
  };

  height = 34;//el[0][0].height - margin.top - margin.bottom;
  
  width = 60;
  radius = width / 2;
  barWidth = 10;


  /*
    Utility methods 
  */
  percToDeg = function(perc) {
    return perc * 360;
  };

  percToRad = function(perc) {
    return degToRad(percToDeg(perc));
  };

  degToRad = function(deg) {
    return deg * Math.PI / 180;
  };

  // Create SVG element
  svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

  // Add layer for the panel
  chart = svg.append('g').attr('transform', "translate(" + ((width + margin.left) / 2) + ", " + ((height + margin.top) / 2) + ")");
  var gardient = chart.append('defs').append("linearGradient").attr({id:"grad"});
  gardient.append("stop").attr({
      offset : "0%",
      "stop-color":"#0F0"
  });
    gardient.append("stop").attr({
      offset : "100%",
      "stop-color":"#F00"
  });
  chart.append('path').attr('class', "arc chart-filled");
  chart.append('path').attr('class', "arc chart-empty");

  arc2 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
  arc1 = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)

  repaintGauge = function (perc) 
  {
    var next_start = totalPercent;
    arcStartRad = percToRad(next_start);
    arcEndRad = arcStartRad + percToRad(perc / 2);
    next_start += perc / 2;


    arc1.startAngle(arcStartRad).endAngle(arcEndRad);

    arcStartRad = percToRad(next_start);
    arcEndRad = arcStartRad + percToRad((1 - perc) / 2);

    arc2.startAngle(arcStartRad + padRad).endAngle(arcEndRad);


    chart.select(".chart-filled").attr('d', arc1);
    chart.select(".chart-empty").attr('d', arc2);

  }


  var Needle = (function() {

    /** 
      * Helper function that returns the `d` value
      * for moving the needle
    **/
    var recalcPointerPos = function(perc) {
      var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
      thetaRad = percToRad(perc / 2);
      centerX = 0;
      centerY = 0;
      topX = centerX - this.len * Math.cos(thetaRad);
      topY = centerY - this.len * Math.sin(thetaRad);
      leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
      leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
      rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
      rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
      return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
    };

    function Needle(el) {
      this.el = el;
      this.len = width / 3;
      this.radius = this.len / 6;
    }

    Needle.prototype.render = function() {
      this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
      return this.el.append('path').attr('class', 'needle').attr('d', recalcPointerPos.call(this, 0));
    };

    Needle.prototype.moveTo = function(perc) {
      var self,
          oldValue = this.perc || 0;

      this.perc = perc;
      self = this;

      // Reset pointer position
      this.el.transition().delay(100).ease('quad').duration(200).select('.needle').tween('reset-progress', function() {
        return function(percentOfPercent) {
          var progress = (1 - percentOfPercent) * oldValue;
          
          repaintGauge(progress);
          return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
        };
      });

      this.el.transition().delay(300).ease('bounce').duration(1500).select('.needle').tween('progress', function() {
        return function(percentOfPercent) {
          var progress = percentOfPercent * perc;
          
          repaintGauge(progress);
          return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
        };
      });

    };

    return Needle;

  })();

  needle = new Needle(chart);
  needle.render();

  needle.moveTo(percent);

};

/*
setInterval(function(){
    needle.moveTo(Math.random());
}, 1000);
*/



// document ready: hide topbar when scrolling
(function ($) {
    var previousScroll = 20;
    // scroll functions
    $(window).scroll(function (e) {

        // add/remove class to navbar when scrolling to hide/show
        var scroll = $(window).scrollTop();
        if (scroll >= previousScroll) {
            $('.navbar').addClass("navbar-hide");

        } else if (scroll < previousScroll) {
            $('.navbar').removeClass("navbar-hide");
        }
        previousScroll = scroll;

    });

})(jQuery);

//notify its parent frame about its total size 
window.addEventListener('DOMContentLoaded', function(e) {
    if ( window.location !== window.parent.location ) {	  // The page is in an iframe
        window.parent.postMessage({
            type: 'resize-iframe',
            payload: {
              width : document.body.scrollWidth,
              height: document.body.scrollHeight
            }
          }, '*');	
    }
});