/**
 * jQuery color contrast
 * @Author:     Jochen Vandendriessche <jochen@builtbyrobot.com>
 * @Author URI:   //builtbyrobot.com
 **/

function debug(o){
  var _r = '';
  for (var k in o){
    _r += 'o[' + k + '] => ' + o[k] + '\n';
  }
  window.alert(_r);
}

(function($){

  var methods = {
    /*
      Function: init

      Initialises the color contrast

      Parameters:
        jQuery object - {object}

      Example
        > // initialise new color contrast calculator
        > $('body').colorcontrast();

    */
    init : function() {
      // check if we have a background image, if not, use the backgroundcolor
      if ($(this).css('background-image') == 'none') {
        $(this).colorcontrast('bgColor');
      }else{
        $(this).colorcontrast('bgImage');
      }
      return this;
    },
    bgColor : function() {
      var t = $(this);
      t.removeClass('dark light');
      t.addClass($(this).colorcontrast('calculateYIQ', t.css('background-color')));
    },
    bgImage : function() {
      var t = $(this);
      t.removeClass('dark light');
      t.addClass($(this).colorcontrast('calculateYIQ', t.colorcontrast('fetchImageColor')));
    },
    fetchImageColor : function(){
      var img = new Image();
      var src = $(this).css('background-image').replace('url(', '').replace(/'/, '').replace(')', '');
      img.src = src;
      var can = document.createElement('canvas');
      var context = can.getContext('2d');
      context.drawImage(img, 0, 0);
      data = context.getImageData(0, 0, 1, 1).data;
      return 'rgb(' + data[0] + ',' + data[1] + ',' + data[2] + ')';
    },
    calculateYIQ : function(color){
      var r = 0, g = 0, b = 0, a = 1, yiq = 0;
      if (/rgba/.test(color)){
        color = color.replace('rgba(', '').replace(')', '').split(/,/);
        r = color[0];
        g = color[1];
        b = color[2];
        a = color[3];
      }else if (/rgb/.test(color)){
        color = color.replace('rgb(', '').replace(')', '').split(/,/);
        r = color[0];
        g = color[1];
        b = color[2];
      }else if(/#/.test(color)){
        color = color.replace('#', '');
        if (color.length == 3){
          var _t = '';
          _t += color[0] + color[0];
          _t += color[1] + color[1];
          _t += color[2] + color[2];
          color = _t;
        }
        r = parseInt(color.substr(0,2),16);
        g = parseInt(color.substr(2,2),16);
        b = parseInt(color.substr(4,2),16);
      }
      yiq = ((r*299)+(g*587)+(b*114))/1000;
      return (yiq >= 128) ? 'light' : 'dark';
    }
  };
  $.fn.colorcontrast = function(method){

    if ( methods[method] ) {
          return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
          return methods.init.apply( this, arguments );
        } else {
          $.error( 'Method ' +  method + ' does not exist on jQuery color contrast' );
    }

  }

})(this.jQuery);

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function borderColor(color) {
  if (color.length < 6 && color.length !== 3) return;

  if (color.length === 3) {
    color = '#' + color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  var rgb = hexToRgb(color),
    hsl = rgbToHsl(rgb.r, rgb.g, rgb.b),
    plus_10 = hslToRgb(hsl[0], hsl[1], (hsl[2] - (hsl[2] * 0.1))),
    new_rgb = 'rgb(' + Math.ceil(plus_10[0]) + ',' + Math.ceil(plus_10[1]) + ',' + Math.ceil(plus_10[2]) + ')';
  return new_rgb;
}

function setColor($this) {
  var temp, pallete, bColor, val;

  val = $this.val();

  if (val.length > 0) {
    bColor = borderColor(val);
    pallete = $this.closest('.row').find('.prefix');
    pallete.css('background-color', '#' + val);
    temp = pallete.colorcontrast('calculateYIQ', '#' + val);
    if (temp === 'light') {
      pallete.css({'border-color': bColor, 'color': '#333'});
    } else {
      pallete.css({'border-color': bColor, 'color': '#eee'});
    }
  }
}

(function ($) {

  $('#toggleCss, #toggleJs, #togglePlugins').change(function() {
    var $boxes = $(this).closest('.row').find('input[type=checkbox]').not($(this));
      $boxes.prop('checked', !$boxes.prop('checked'));
  });


  $('#rowWidth, #columnCount').keyup(function(e) {
    var val = $(this).val();
    if(val > 100) $(this).val(100);
  });

  $('.color-picker').each(function() {
    setColor($(this));
  });

  $('.color-picker').keyup(function() {
    setColor($(this));
  });

  $("#columnCount, #baseFontSize, #importantNumber, #baseButtonRadius, #baseButtonSize").keydown(function(event) {
    // allow tab key to work
    if (event.keyCode === 9) {
      return true;
    }

    if(event.shiftKey)
      event.preventDefault();
    if (event.keyCode == 46 || event.keyCode == 8) {
    } else {
      if (event.keyCode < 95) {
        if (event.keyCode < 48 || event.keyCode > 57) {
          event.preventDefault();
        }
      } else {
        if (event.keyCode < 96 || event.keyCode > 105) {
          event.preventDefault();
        }
      }
    }
  });

  $("#maxWidth, #columnGutter").keydown(function(event){
    if (event.which === 9) {
      return true;
    }
    if (event.shiftKey) {
      event.preventDefault();
    }
    // Allow only backspace, numbers, and period
    if ($.inArray(event.which, [8,48,49,50,51,52,53,54,55,56,57,190,96,97,98,99,100,101,102,103,104,105]) === -1) {
      event.preventDefault();
    }
  });


  $('#customBuild').on('click', ':checkbox[data-scss-dependency]', function(e){
    if ($(this).is(':checked')) {
      var dep = $(this).attr('data-scss-dependency');
      $.each(dep.split(','), function(d_idx, d_el){
        if (d_el != '') {
          $('#customBuild').find(':checkbox[value="'+d_el+'"]').attr('checked', true);
        }
      });
    }

  });

  $('#packageSubmit').on('click', function(e) {
    window.deps = [];

    // e.preventDefault();

    // Checks for px, rem, # to prevent empty css files
    $('.pixel-value').each(function(){
      $(this).val($(this).val().split('px')[0]);
      $(this).val($(this).val() + 'px');
    });
    $('.rem-value').each(function(){
      $(this).val($(this).val().split('rem')[0]);
      $(this).val($(this).val() + 'rem');
    });
    $('.color-picker').each(function(){
      var str = $(this).val();

      if (/#/.test(str)) {
        $(this).val($(this).val());
      } else {
        $(this).val('#' + $(this).val());
      }
    });


    var $form = $(e.currentTarget).closest('form');

    $form.find('input[type=hidden][name^=js_files]').remove(); // remove any existing deps

    $form.find(':checkbox[data-js-dependency]:checked').each(function(idx, el){
      var dep = $(el).attr('data-js-dependency');
      $.each(dep.split(','), function(d_idx, d_el){
        if (d_el != '') {
          if (window.deps.indexOf(d_el) === -1) {
            window.deps.push(d_el);
            var $dep = $('<input type="hidden" name="js_files[]" />').attr('value', d_el);
            $form.append($dep);
          }
        }
      });
    });

    // data-scss-dependency=""
    $form.find(':checkbox[data-scss-dependency]:checked').each(function(idx, el){
      var dep = $(el).attr('data-scss-dependency');
      $.each(dep.split(','), function(d_idx, d_el){
        if (d_el != '') {
          $form.find(':checkbox[value="'+d_el+'"]').attr('checked', true);
        }
      });
    });

    $form.submit();
    setTimeout(function(){
      $(".pixel-value", $form).each(function() {
        $(this).val($(this).val().split('px')[0]);
      });
      $(".rem-value", $form).each(function() {
        $(this).val($(this).val().split('rem')[0]);
      });
      $('.color-picker', $form).each(function(){
        $(this).val($(this).val().split('#')[1]);
      });
    },1500);
  });

  // $('[data-src-download="4.0"]').on('click', function(e){
  //   e.preventDefault();
  //   $("form#customBuild").trigger('reset').trigger('submit');
  // });

})(jQuery);



$(document).on('click', '[data-src-download]', function(event){
   var version = $(event.currentTarget).attr('data-src-download');
   ga('send', 'event', 'Foundation', 'Downloaded', version);
   // _gaq.push(['_trackEvent', 'Foundation', 'Downloaded', version]);
});
