/**
 * Sleepy Modal
 *
 * Highly customizable modals
 *
 */

;(function ($, window, document) {

  var

    // Set some defaults
    defaults = {
      escKey : true,
      forceShow : false,
      preventDefault : true,
      showOverlay : true,
      overlaySelector : '#overlay',
      modalSelector : '#modal',
      modalContentSelector : '#modal-content',
      closeSelector : '.close-modal',
      transitionIn : {
        effect : 'fadeIn', // fadeIn, ...
        duration : 'fast' // fast, slow, int, ...
      },
      transitionOut : {
        effect : 'fadeOut', // fadeOut, ...
        duration : 'fast' // fast, slow, int, ...
      },
      height : 'auto',
      width : 'auto',
      remote : {
        url : false,
        type : 'get',
        data : {}
      },
      event : 'click',
      xPos : 'center', // left, center, right, int, ...
      yPos : 'center', // top, center, bottom, int, ...
      content : false,
      onCloseNavTo : false,
      onBeforeShow : false,
      onAfterShow : false,
      onBeforeHide : false,
      onAfterHide : false
    },

    // Set the name of the plugin
    pluginName = 'sleepyModal';

  /**
   * Constructor
   */

  function SleepyModal (element, options) {

    if ( element ) {

      // Set the current DOM node being acted upon
      this.element = element;

      // Set the current jQuery object being acted upon
      this.$element = $(element);

      // Set the current DOM node tag name being acted upon (e.g. "select" or "a")
      if ( this.$element.prop('tagName') && typeof( this.$element.prop('tagName') ) == 'string' ) {
        this.htmlTag = this.$element.prop('tagName').toLowerCase();
      };

    };

    // Set allowed events
    this.allowedEvents = [
      'keydown', 'keypress', 'keyup',
      'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'hover', 'click', 'dblclick',
      'focus', 'blur', 'focusin', 'focusout', 'change', 'select'
    ];

    // Set allowed transitions in
    this.allowedTransitionIn = []

    // Set allowed transitions out
    this.allowedTransitionOut = []

    // Merge the options into the defaults
    this.options = $.extend( true, {}, defaults, options );

    // Set a reference to the original, un-merged defaults
    this._defaults = defaults;

    // Set a reference to the name of the plugin
    this._name = pluginName;

    // If no "modalContentSelector" option is given
    // (since it's optional), use the "modalSelector"
    // instead (since it's required)
    this.options.modalContentSelector = (this.options.modalContentSelector && this.options.modalContentSelector != '') ? this.options.modalContentSelector : this.options.modalSelector;

    // Away we go!
    this.init();

  };

  /**
   * Public methods
   */

  SleepyModal.prototype.init = function () {
    var self = this;

    this.showOverlay = function () {
      if ( !$(this.options.overlaySelector).is(':visible') ) {
        if ( this.options.overlaySelector ) {
          if ( this.options.transitionIn ) {
            switch ( this.options.transitionIn.effect ) {
              case 'fadeIn':
                $(this.options.overlaySelector).fadeIn( this.options.transitionIn.duration );
                break;
              default:
                $(this.options.overlaySelector).show();
            };
          };
        };
      };
    };

    this.focusFirstFormField = function () {
      $firstFormField = $(this.options.modalContentSelector + ' input[type=submit],' + this.options.modalContentSelector + ' input[type=password],' + this.options.modalContentSelector + ' input[type=email],' + this.options.modalContentSelector + ' input[type=text],' + this.options.modalContentSelector + ' select,' + this.options.modalContentSelector + ' textarea').not('.no-auto-focus').first();
      if ( $firstFormField.parent().hasClass('custom-select') || $firstFormField.parent().hasClass('custom-checkbox') ) {
        $firstFormField.parent('.custom-select, .custom-checkbox').addClass('focus');
      };
      $firstFormField.focus();
    },

    this.hideOverlay = function () {
      if ( this.options.overlaySelector ) {
        if ( this.options.transitionOut ) {
          switch ( this.options.transitionOut.effect ) {
            case 'fadeOut':
              $(this.options.overlaySelector).fadeOut( this.options.transitionOut.duration );
              break;
            default:
              $(this.options.overlaySelector).hide();
          };
        };
      };
    };

    this.showModal = function () {
      this.showOverlay();
      this.onBeforeShow();
      if ( !$(this.options.modalSelector).is(':visible') ) {
        if ( this.options.transitionIn ) {
          switch ( this.options.transitionIn.effect ) {
            case 'fadeIn':
              this.injectContent();
              this.sizeModal();
              this.positionModal();
              $(this.options.modalSelector).fadeIn( this.options.transitionIn.duration, function () {
                self.focusFirstFormField();
                self.onAfterShow();
              });
              break;
            default:
              $(this.options.modalSelector).show( function () {
                self.injectContent();
                self.sizeModal();
                self.positionModal();
                self.focusFirstFormField();
                self.onAfterShow();
              });
          };
        };
      } else {
        this.hideModal( true );
      };
    };

    this.hideModal = function (showAfterHide) {
      this.onBeforeHide();
      if ( this.options.transitionOut ) {
        switch ( this.options.transitionOut.effect ) {
          case 'fadeOut':
            $(this.options.modalSelector).fadeOut( this.options.transitionOut.duration, function () {
              self.removeContent();
              if (showAfterHide) {
                self.showModal();
              };
            });
            break;
          default:
            $(this.options.modalSelector).hide( function () {
              self.removeContent();
              if (showAfterHide) {
                self.showModal();
              };
            });
        };
      };
      this.onAfterHide();
    };

    this.injectContent = function () {
      $(this.options.modalContentSelector).html( this.content );
    };

    this.removeContent = function () {
      $(self.options.modalContentSelector).empty();
    };

    this.positionModal = function () {
      // Horizontal position
      switch ( this.options.xPos ) {
        case 'left':
          $(this.options.modalSelector).css({
            left : 0
          });
          break;
        case 'center':
          $(this.options.modalSelector).css({
            left : ( $(window).width() - $(this.options.modalSelector).outerWidth() ) / 2
          });
          break;
        case 'right':
          $(this.options.modalSelector).css({
            right : 0
          });
          break;
        default:
          $(this.options.modalSelector).css({
            left : ( $(window).width() - $(this.options.modalSelector).outerWidth() ) / 2
          });
      };
      // Vertical position
      switch ( this.options.yPos ) {
        case 'top':
          $(this.options.modalSelector).css({
            top : 0
          });
          break;
        case 'center':
          $(this.options.modalSelector).css({
            top : ( $(window).height() - $(this.options.modalSelector).outerHeight() ) / 2
          });
          break;
        case 'bottom':
          $(this.options.modalSelector).css({
            bottom : 0
          });
          break;
        default:
          $(this.options.modalSelector).css({
            top : ( $(window).height() - $(this.options.modalSelector).outerHeight() ) / 2
          });
      };
    };

    this.sizeModal = function () {
      $(this.options.modalSelector).css({
        height : this.options.height,
        width : this.options.width,
      });
    };

    this.bindModalClose = function () {
      if ( this.options.closeSelector ) {
        $(document).on('click', this.options.closeSelector, function (event) {
          self.hideOverlay();
          self.hideModal();
          self.onCloseNavigateTo();
        });
      };
      if ( this.options.overlaySelector ) {
        $(document).on('click', this.options.overlaySelector, function (event) {
          self.hideOverlay();
          self.hideModal();
          self.onCloseNavigateTo();
        });
      };
      if ( this.options.escKey ) {
        $(document).on('keyup', function (event) {
          if ( event.which == 27 ) {
            self.hideOverlay();
            self.hideModal();
            self.onCloseNavigateTo();
          };
        });
      };
    };

    this.onCloseNavigateTo = function () {
      if ( this.options.onCloseNavTo && typeof( this.options.onCloseNavTo ) == 'string' ) {
        window.location = this.options.onCloseNavTo;
      };
    };

    this.bindModalOpen = function () {
      if ( this.options.forceShow || !this.element ) {
        this.getContent();
      } else {
        this.$element.on( this.options.event, function (event) {
          self.getContent();
        });
      };
    };

    this.getContent = function () {
      if ( this.options.remote.url && this.options.remote.url != '' ) {
        $.ajax({
          url : this.options.remote.url,
          type : this.options.remote.type,
          data : this.options.remote.data,
          success : function ( response ) {
            self.content = response;
            self.showModal();
          },
          error : function ( jqXHR, textStatus, errorThrown ) {
            // TODO
          }
        });
      } else {
        this.content = this.options.content;
        this.showModal();
      };
    };

    this.bindPreventDefault = function () {
      if ( this.options.preventDefault ) {
        $(document).on('click', this.$element, function (event) {
          // event.preventDefault();
        });
      };
    };

    this.bindWindowResize = function () {
      $(window).on('resize', function (event) {
        self.positionModal();
      });
    };

    this.bindEvents = function () {
      this.bindModalOpen();
      this.bindPreventDefault();
      this.bindModalClose();
      this.bindWindowResize();
    };

    this.destroyModal = function () {
      // Destroy modal
    };

    this.onBeforeShow = function () {
      if (this.options.onBeforeShow && typeof(this.options.onBeforeShow) == 'function' ) {
        this.options.onBeforeShow();
      };
    };

    this.onAfterShow = function () {
      if (this.options.onAfterShow && typeof(this.options.onAfterShow) == 'function' ) {
        this.options.onAfterShow();
      };
    };

    this.onBeforeHide = function () {
      if (this.options.onBeforeHide && typeof(this.options.onBeforeHide) == 'function' ) {
        this.options.onBeforeHide();
      };
    };

    this.onAfterHide = function () {
      if (this.options.onAfterHide && typeof(this.options.onAfterHide) == 'function' ) {
        this.options.onAfterHide();
      };
    };

    this.checkValidBindEvents = function () {
      if ( $.isArray( this.options.event ) ) {
        var validEvents = [];
        for ( var e in this.options.event ) {
          if ( $.inArray( e, self.allowedEvents ) > -1 ) {
            validEvents.push(e);
          };
        };
        this.options.event = validEvents.join(' ');
        this.bindEvents();
      } else if ( $.inArray( this.options.event, this.allowedEvents ) > -1 ) {
        this.bindEvents();
      };
    };

    this.exec = function () {
      this.checkValidBindEvents();
    };

    this.exec();

  };

  /*
   * Plugin wrapper
   */

$.sleepyModal = $.fn[pluginName] = function (options) {

    // If using the $.sleepyModal() format (i.e., sans-selector)...
    if ( !this.selector ) {

      return new SleepyModal( false, options );

    // Otherwise, if a selector is provided...
    } else {

      // For every matched selector found...
      return this.each( function () {

        // Set some jQuery data if it doesn't already exist
        if ( !$.data( this, 'plugin_' + pluginName ) || options.forceShow ) {
          $.data( this, 'plugin_' + pluginName, new SleepyModal( this, options ) );
        };

      });

    };

  };

})(jQuery, window, document);
