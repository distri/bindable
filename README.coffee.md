Bindable
========

Add event binding to objects.

>     bindable = Bindable()
>     bindable.on "greet", ->
>       console.log "yo!"
>     bindable.trigger "greet"
>     #=> "yo!" is printed to log

Use as a mixin.

>    self.include Bindable

    module.exports = (I={}, self={}) ->
      eventCallbacks = {}

Adds a function as an event listener.

This will call `coolEventHandler` after `yourObject.trigger "someCustomEvent"`
is called.

>     yourObject.on "someCustomEvent", coolEventHandler

Handlers can be attached to namespaces as well. The namespaces are only used
for finer control of targeting event removal. For example if you are making a
custom drawing system you could unbind `".Drawable"` events and add your own.

>     yourObject.on ""

      self.on = (namespacedEvent, callback) ->
        [event, namespace] = namespacedEvent.split(".")

        # HACK: Here we annotate the callback function with namespace metadata
        # This will probably lead to some strange edge cases, but should work fine
        # for simple cases.
        if namespace
          callback.__PIXIE ||= {}
          callback.__PIXIE[namespace] = true

        eventCallbacks[event] ||= []
        eventCallbacks[event].push(callback)

        return self

Removes a specific event listener, or all event listeners if
no specific listener is given.

Removes the handler coolEventHandler from the event `"someCustomEvent"` while
leaving the other events intact.

>     yourObject.off "someCustomEvent", coolEventHandler

Removes all handlers attached to `"anotherCustomEvent"`

>     yourObject.off "anotherCustomEvent"

Remove all handlers from the `".Drawable" namespace`

>     yourObject.off ".Drawable"

      self.off = (namespacedEvent, callback) ->
        [event, namespace] = namespacedEvent.split(".")

        if event
          eventCallbacks[event] ||= []

          if namespace
            # Select only the callbacks that do not have this namespace metadata
            eventCallbacks[event] = eventCallbacks.filter (callback) ->
              !callback.__PIXIE?[namespace]?

          else
            if callback
              remove eventCallbacks[event], callback
            else
              eventCallbacks[event] = []
        else if namespace
          # No event given
          # Select only the callbacks that do not have this namespace metadata
          # for any events bound
          for key, callbacks of eventCallbacks
            eventCallbacks[key] = callbacks.filter (callback) ->
              !callback.__PIXIE?[namespace]?

        return self

Calls all listeners attached to the specified event.

>     # calls each event handler bound to "someCustomEvent"
>     yourObject.trigger "someCustomEvent"

Additional parameters can be passed to the handlers.

>     yourObject.trigger "someEvent", "hello", "anotherParameter"

      self.trigger = (event, parameters...) ->
        (eventCallbacks["*"] or []).forEach (callback) ->
          callback.apply(self, [event].concat(parameters))

        unless event is "*"
          (eventCallbacks[event] or []).forEach (callback) ->
            callback.apply(self, parameters)

        return self

      return self

Helpers
-------

Remove a value from an array.

    remove = (array, value) ->
      index = array.indexOf(value)

      if index >= 0
        array.splice(index, 1)[0]
