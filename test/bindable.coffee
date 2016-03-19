test = it
ok = assert
equal = assert.equal

Bindable = require "../README"

describe "Bindable", ->

  test "#bind and #trigger", ->
    o = Bindable()

    o.on("test", -> ok true)

    o.trigger("test")

  test "Multiple bindings", ->
    o = Bindable()

    o.on("test", -> ok true)
    o.on("test", -> ok true)

    o.trigger("test")

  test "#trigger arguments", ->
    o = Bindable()

    param1 = "the message"
    param2 = 3

    o.on "test", (p1, p2) ->
      equal(p1, param1)
      equal(p2, param2)

    o.trigger "test", param1, param2

  test "#unbind", ->
    o = Bindable()

    callback = ->
      ok false

    o.on "test", callback
    # Unbind specific event
    o.off "test", callback
    o.trigger "test"

    o.on "test", callback
    # Unbind all events
    o.off "test"
    o.trigger "test"

  test "#trigger namespace", ->
    o = Bindable()
    o.on "test.TestNamespace", ->
      ok true

    o.trigger "test"

    o.off ".TestNamespace"
    o.trigger "test"

  test "#unbind namespaced", ->
    o = Bindable()

    o.on "test.TestNamespace", ->
      ok true

    o.trigger "test"

    o.off ".TestNamespace", ->
    o.trigger "test"
