###*
Lazy Modal

Highly customizable modals
###
(($, window, document) ->

  # Set some defaults
  # fadeIn, ...
  # fast, slow, int, ...
  # fadeOut, ...
  # fast, slow, int, ...
  # left, center, right, int, ...
  # top, center, bottom, int, ...

  # Set the name of the plugin

  ###*
  Constructor
  ###
  LazyModal = (element, options) ->
    console.log "jalksdjf"
    if element

      # Set the current DOM node being acted upon
      @element = element

      # Set the current jQuery object being acted upon
      @$element = $(element)

      # Set the current DOM node tag name being acted upon (e.g. "select" or "a")
      @htmlTag = @$element.prop("tagName").toLowerCase()  if @$element.prop("tagName") and typeof (@$element.prop("tagName")) is "string"

    # Set allowed events
    @allowedEvents = [
      "keydown"
      "keypress"
      "keyup"
      "mousedown"
      "mouseenter"
      "mouseleave"
      "mousemove"
      "mouseout"
      "mouseover"
      "mouseup"
      "hover"
      "click"
      "dblclick"
      "focus"
      "blur"
      "focusin"
      "focusout"
      "change"
      "select"
    ]

    # Set allowed transitions in
    @allowedTransitionIn = []

    # Set allowed transitions out
    @allowedTransitionOut = []

    # Merge the options into the defaults
    @options = $.extend(true, {}, defaults, options)

    # Set a reference to the original, un-merged defaults
    @_defaults = defaults

    # Set a reference to the name of the plugin
    @_name = pluginName

    # If no "modalContentSelector" option is given
    # (since it's optional), use the "modalSelector"
    # instead (since it's required)
    @options.modalContentSelector = (if (@options.modalContentSelector and @options.modalContentSelector isnt "") then @options.modalContentSelector else @options.modalSelector)

    # Away we go!
    @init()
    return
  defaults =
    escKey: true
    forceShow: false
    preventDefault: true
    showOverlay: true
    overlaySelector: "#overlay"
    modalSelector: "#modal"
    modalContentSelector: "#modal-content"
    closeSelector: ".close-modal"
    transitionIn:
      effect: "fadeIn"
      duration: "fast"

    transitionOut:
      effect: "fadeOut"
      duration: "fast"

    height: "auto"
    width: "auto"
    remote:
      url: false
      type: "get"
      data: {}

    event: "click"
    xPos: "center"
    yPos: "center"
    content: false
    onCloseNavTo: false
    onBeforeShow: false
    onAfterShow: false
    onBeforeHide: false
    onAfterHide: false

  pluginName = "lazyModal"

  ###*
  Public methods
  ###
  LazyModal::init = ->
    self = this
    @showOverlay = ->
      unless $(@options.overlaySelector).is(":visible")
        if @options.overlaySelector
          if @options.transitionIn
            switch @options.transitionIn.effect
              when "fadeIn"
                $(@options.overlaySelector).fadeIn @options.transitionIn.duration
              else
                $(@options.overlaySelector).show()
      return

    @focusFirstFormField = ->
      $firstFormField = $(@options.modalContentSelector + " input[type=submit]," + @options.modalContentSelector + " input[type=password]," + @options.modalContentSelector + " input[type=email]," + @options.modalContentSelector + " input[type=text]," + @options.modalContentSelector + " select," + @options.modalContentSelector + " textarea").not(".no-auto-focus").first()
      $firstFormField.parent(".custom-select, .custom-checkbox").addClass "focus"  if $firstFormField.parent().hasClass("custom-select") or $firstFormField.parent().hasClass("custom-checkbox")
      $firstFormField.focus()
      return

    @hideOverlay = ->
      if @options.overlaySelector
        if @options.transitionOut
          switch @options.transitionOut.effect
            when "fadeOut"
              $(@options.overlaySelector).fadeOut @options.transitionOut.duration
            else
              $(@options.overlaySelector).hide()
      return


    @showModal = ->
      @showOverlay()
      @onBeforeShow()
      unless $(@options.modalSelector).is(":visible")
        if @options.transitionIn
          switch @options.transitionIn.effect
            when "fadeIn"
              @injectContent()
              @sizeModal()
              @positionModal()
              $(@options.modalSelector).fadeIn @options.transitionIn.duration, ->
                self.focusFirstFormField()
                self.onAfterShow()
                return

            else
              $(@options.modalSelector).show ->
                self.injectContent()
                self.sizeModal()
                self.positionModal()
                self.focusFirstFormField()
                self.onAfterShow()
                return

      else
        @hideModal true
      return

    @hideModal = (showAfterHide) ->
      @onBeforeHide()
      if @options.transitionOut
        switch @options.transitionOut.effect
          when "fadeOut"
            $(@options.modalSelector).fadeOut @options.transitionOut.duration, ->
              self.removeContent()
              self.showModal()  if showAfterHide
              return

          else
            $(@options.modalSelector).hide ->
              self.removeContent()
              self.showModal()  if showAfterHide
              return

      @onAfterHide()
      return

    @injectContent = ->
      $(@options.modalContentSelector).html @content
      return

    @removeContent = ->
      $(self.options.modalContentSelector).empty()
      return

    @positionModal = ->

      # Horizontal position
      switch @options.xPos
        when "left"
          $(@options.modalSelector).css left: 0
        when "center"
          $(@options.modalSelector).css left: ($(window).width() - $(@options.modalSelector).outerWidth()) / 2
        when "right"
          $(@options.modalSelector).css right: 0
        else
          $(@options.modalSelector).css left: ($(window).width() - $(@options.modalSelector).outerWidth()) / 2

      # Vertical position
      switch @options.yPos
        when "top"
          $(@options.modalSelector).css top: 0
        when "center"
          $(@options.modalSelector).css top: ($(window).height() - $(@options.modalSelector).outerHeight()) / 2
        when "bottom"
          $(@options.modalSelector).css bottom: 0
        else
          $(@options.modalSelector).css top: ($(window).height() - $(@options.modalSelector).outerHeight()) / 2
      return

    @sizeModal = ->
      $(@options.modalSelector).css
        height: @options.height
        width: @options.width

      return

    @bindModalClose = ->
      if @options.closeSelector
        $(document).on "click", @options.closeSelector, (event) ->
          self.hideOverlay()
          self.hideModal()
          self.onCloseNavigateTo()
          return

      if @options.overlaySelector
        $(document).on "click", @options.overlaySelector, (event) ->
          self.hideOverlay()
          self.hideModal()
          self.onCloseNavigateTo()
          return

      if @options.escKey
        $(document).on "keyup", (event) ->
          if event.which is 27
            self.hideOverlay()
            self.hideModal()
            self.onCloseNavigateTo()
          return

      return

    @onCloseNavigateTo = ->
      window.location = @options.onCloseNavTo  if @options.onCloseNavTo and typeof (@options.onCloseNavTo) is "string"
      return

    @bindModalOpen = ->
      if @options.forceShow or not @element
        @getContent()
      else
        @$element.on @options.event, (event) ->
          self.getContent()
          return

      return

    @getContent = ->
      if @options.remote.url and @options.remote.url isnt ""
        $.ajax
          url: @options.remote.url
          type: @options.remote.type
          data: @options.remote.data
          success: (response) ->
            self.content = response
            self.showModal()
            return

          error: (jqXHR, textStatus, errorThrown) ->


      # TODO
      else
        @content = @options.content
        @showModal()
      return

    @bindPreventDefault = ->
      if @options.preventDefault
        $(document).on "click", @$element, (event) ->

      return


    # event.preventDefault();
    @bindWindowResize = ->
      $(window).on "resize", (event) ->
        self.positionModal()
        return

      return

    @bindEvents = ->
      @bindModalOpen()
      @bindPreventDefault()
      @bindModalClose()
      @bindWindowResize()
      return

    @destroyModal = ->


    # Destroy modal
    @onBeforeShow = ->
      @options.onBeforeShow()  if @options.onBeforeShow and typeof (@options.onBeforeShow) is "function"
      return

    @onAfterShow = ->
      @options.onAfterShow()  if @options.onAfterShow and typeof (@options.onAfterShow) is "function"
      return

    @onBeforeHide = ->
      @options.onBeforeHide()  if @options.onBeforeHide and typeof (@options.onBeforeHide) is "function"
      return

    @onAfterHide = ->
      @options.onAfterHide()  if @options.onAfterHide and typeof (@options.onAfterHide) is "function"
      return

    @checkValidBindEvents = ->
      if $.isArray(@options.event)
        validEvents = []
        for e of @options.event
          validEvents.push e  if $.inArray(e, self.allowedEvents) > -1
        @options.event = validEvents.join(" ")
        @bindEvents()
      else @bindEvents()  if $.inArray(@options.event, @allowedEvents) > -1
      return

    @exec = ->
      @checkValidBindEvents()
      return

    @exec()
    return


  #
  #   * Plugin wrapper
  #
  $.lazyModal = $.fn[pluginName] = (options) ->

    # If using the $.lazyModal() format (i.e., sans-selector)...
    unless @selector
      return new LazyModal(false, options)

    # Otherwise, if a selector is provided...
    else

      # For every matched selector found...
      return @each(->

        # Set some jQuery data if it doesn't already exist
        $.data this, "plugin_" + pluginName, new LazyModal(this, options)  if not $.data(this, "plugin_" + pluginName) or options.forceShow
        return
      )
    return

  return
) jQuery, window, document
