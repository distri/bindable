(function(pkg) {
  (function() {
  var annotateSourceURL, cacheFor, circularGuard, defaultEntryPoint, fileSeparator, generateRequireFn, global, isPackage, loadModule, loadPackage, loadPath, normalizePath, publicAPI, rootModule, startsWith,
    __slice = [].slice;

  fileSeparator = '/';

  global = self;

  defaultEntryPoint = "main";

  circularGuard = {};

  rootModule = {
    path: ""
  };

  loadPath = function(parentModule, pkg, path) {
    var cache, localPath, module, normalizedPath;
    if (startsWith(path, '/')) {
      localPath = [];
    } else {
      localPath = parentModule.path.split(fileSeparator);
    }
    normalizedPath = normalizePath(path, localPath);
    cache = cacheFor(pkg);
    if (module = cache[normalizedPath]) {
      if (module === circularGuard) {
        throw "Circular dependency detected when requiring " + normalizedPath;
      }
    } else {
      cache[normalizedPath] = circularGuard;
      try {
        cache[normalizedPath] = module = loadModule(pkg, normalizedPath);
      } finally {
        if (cache[normalizedPath] === circularGuard) {
          delete cache[normalizedPath];
        }
      }
    }
    return module.exports;
  };

  normalizePath = function(path, base) {
    var piece, result;
    if (base == null) {
      base = [];
    }
    base = base.concat(path.split(fileSeparator));
    result = [];
    while (base.length) {
      switch (piece = base.shift()) {
        case "..":
          result.pop();
          break;
        case "":
        case ".":
          break;
        default:
          result.push(piece);
      }
    }
    return result.join(fileSeparator);
  };

  loadPackage = function(pkg) {
    var path;
    path = pkg.entryPoint || defaultEntryPoint;
    return loadPath(rootModule, pkg, path);
  };

  loadModule = function(pkg, path) {
    var args, content, context, dirname, file, module, program, values;
    if (!(file = pkg.distribution[path])) {
      throw "Could not find file at " + path + " in " + pkg.name;
    }
    if ((content = file.content) == null) {
      throw "Malformed package. No content for file at " + path + " in " + pkg.name;
    }
    program = annotateSourceURL(content, pkg, path);
    dirname = path.split(fileSeparator).slice(0, -1).join(fileSeparator);
    module = {
      path: dirname,
      exports: {}
    };
    context = {
      require: generateRequireFn(pkg, module),
      global: global,
      module: module,
      exports: module.exports,
      PACKAGE: pkg,
      __filename: path,
      __dirname: dirname
    };
    args = Object.keys(context);
    values = args.map(function(name) {
      return context[name];
    });
    Function.apply(null, __slice.call(args).concat([program])).apply(module, values);
    return module;
  };

  isPackage = function(path) {
    if (!(startsWith(path, fileSeparator) || startsWith(path, "." + fileSeparator) || startsWith(path, ".." + fileSeparator))) {
      return path.split(fileSeparator)[0];
    } else {
      return false;
    }
  };

  generateRequireFn = function(pkg, module) {
    var fn;
    if (module == null) {
      module = rootModule;
    }
    if (pkg.name == null) {
      pkg.name = "ROOT";
    }
    if (pkg.scopedName == null) {
      pkg.scopedName = "ROOT";
    }
    fn = function(path) {
      var otherPackage;
      if (typeof path === "object") {
        return loadPackage(path);
      } else if (isPackage(path)) {
        if (!(otherPackage = pkg.dependencies[path])) {
          throw "Package: " + path + " not found.";
        }
        if (otherPackage.name == null) {
          otherPackage.name = path;
        }
        if (otherPackage.scopedName == null) {
          otherPackage.scopedName = "" + pkg.scopedName + ":" + path;
        }
        return loadPackage(otherPackage);
      } else {
        return loadPath(module, pkg, path);
      }
    };
    fn.packageWrapper = publicAPI.packageWrapper;
    fn.executePackageWrapper = publicAPI.executePackageWrapper;
    return fn;
  };

  publicAPI = {
    generateFor: generateRequireFn,
    packageWrapper: function(pkg, code) {
      return ";(function(PACKAGE) {\n  var src = " + (JSON.stringify(PACKAGE.distribution.main.content)) + ";\n  var Require = new Function(\"PACKAGE\", \"return \" + src)({distribution: {main: {content: src}}});\n  var require = Require.generateFor(PACKAGE);\n  " + code + ";\n})(" + (JSON.stringify(pkg, null, 2)) + ");";
    },
    executePackageWrapper: function(pkg) {
      return publicAPI.packageWrapper(pkg, "require('./" + pkg.entryPoint + "')");
    },
    loadPackage: loadPackage
  };

  if (typeof exports !== "undefined" && exports !== null) {
    module.exports = publicAPI;
  } else {
    global.Require = publicAPI;
  }

  startsWith = function(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  };

  cacheFor = function(pkg) {
    if (pkg.cache) {
      return pkg.cache;
    }
    Object.defineProperty(pkg, "cache", {
      value: {}
    });
    return pkg.cache;
  };

  annotateSourceURL = function(program, pkg, path) {
    return "" + program + "\n//# sourceURL=" + pkg.scopedName + "/" + path;
  };

  return publicAPI;

}).call(this);

  window.require = Require.generateFor(pkg);
})({
  "source": {
    "LICENSE": {
      "path": "LICENSE",
      "content": "The MIT License (MIT)\n\nCopyright (c) 2014 distri\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of\nthis software and associated documentation files (the \"Software\"), to deal in\nthe Software without restriction, including without limitation the rights to\nuse, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of\nthe Software, and to permit persons to whom the Software is furnished to do so,\nsubject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS\nFOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR\nCOPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER\nIN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN\nCONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n",
      "mode": "100644",
      "type": "blob"
    },
    "README.coffee.md": {
      "path": "README.coffee.md",
      "content": "Bindable\n========\n\nAdd event binding to objects.\n\n>     bindable = Bindable()\n>     bindable.on \"greet\", ->\n>       console.log \"yo!\"\n>     bindable.trigger \"greet\"\n>     #=> \"yo!\" is printed to log\n\nUse as a mixin.\n\n>    self.include Bindable\n\n    module.exports = (I={}, self={}) ->\n      eventCallbacks = {}\n\nAdds a function as an event listener.\n\nThis will call `coolEventHandler` after `yourObject.trigger \"someCustomEvent\"`\nis called.\n\n>     yourObject.on \"someCustomEvent\", coolEventHandler\n\nHandlers can be attached to namespaces as well. The namespaces are only used\nfor finer control of targeting event removal. For example if you are making a\ncustom drawing system you could unbind `\".Drawable\"` events and add your own.\n\n>     yourObject.on \"\"\n\n      self.on = (namespacedEvent, callback) ->\n        [event, namespace] = namespacedEvent.split(\".\")\n\n        # HACK: Here we annotate the callback function with namespace metadata\n        # This will probably lead to some strange edge cases, but should work fine\n        # for simple cases.\n        if namespace\n          callback.__PIXIE ||= {}\n          callback.__PIXIE[namespace] = true\n\n        eventCallbacks[event] ||= []\n        eventCallbacks[event].push(callback)\n\n        return self\n\nRemoves a specific event listener, or all event listeners if\nno specific listener is given.\n\nRemoves the handler coolEventHandler from the event `\"someCustomEvent\"` while\nleaving the other events intact.\n\n>     yourObject.off \"someCustomEvent\", coolEventHandler\n\nRemoves all handlers attached to `\"anotherCustomEvent\"`\n\n>     yourObject.off \"anotherCustomEvent\"\n\nRemove all handlers from the `\".Drawable\" namespace`\n\n>     yourObject.off \".Drawable\"\n\n      self.off = (namespacedEvent, callback) ->\n        [event, namespace] = namespacedEvent.split(\".\")\n\n        if event\n          eventCallbacks[event] ||= []\n\n          if namespace\n            # Select only the callbacks that do not have this namespace metadata\n            eventCallbacks[event] = eventCallbacks.filter (callback) ->\n              !callback.__PIXIE?[namespace]?\n\n          else\n            if callback\n              remove eventCallbacks[event], callback\n            else\n              eventCallbacks[event] = []\n        else if namespace\n          # No event given\n          # Select only the callbacks that do not have this namespace metadata\n          # for any events bound\n          for key, callbacks of eventCallbacks\n            eventCallbacks[key] = callbacks.filter (callback) ->\n              !callback.__PIXIE?[namespace]?\n\n        return self\n\nCalls all listeners attached to the specified event.\n\n>     # calls each event handler bound to \"someCustomEvent\"\n>     yourObject.trigger \"someCustomEvent\"\n\nAdditional parameters can be passed to the handlers.\n\n>     yourObject.trigger \"someEvent\", \"hello\", \"anotherParameter\"\n\n      self.trigger = (event, parameters...) ->\n        (eventCallbacks[\"*\"] or []).forEach (callback) ->\n          callback.apply(self, [event].concat(parameters))\n\n        unless event is \"*\"\n          (eventCallbacks[event] or []).forEach (callback) ->\n            callback.apply(self, parameters)\n\n        return self\n\n      return self\n\nHelpers\n-------\n\nRemove a value from an array.\n\n    remove = (array, value) ->\n      index = array.indexOf(value)\n\n      if index >= 0\n        array.splice(index, 1)[0]\n",
      "mode": "100644",
      "type": "blob"
    },
    "pixie.cson": {
      "path": "pixie.cson",
      "content": "entryPoint: \"README\"\nversion: \"0.3.0\"\n",
      "mode": "100644",
      "type": "blob"
    },
    "test/bindable.coffee": {
      "path": "test/bindable.coffee",
      "content": "test = it\nok = assert\nequal = assert.equal\n\nBindable = require \"../README\"\n\ndescribe \"Bindable\", ->\n\n  test \"#on and #trigger\", ->\n    o = Bindable()\n\n    o.on(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"Multiple bindings\", ->\n    o = Bindable()\n\n    o.on(\"test\", -> ok true)\n    o.on(\"test\", -> ok true)\n\n    o.trigger(\"test\")\n\n  test \"#trigger arguments\", ->\n    o = Bindable()\n\n    param1 = \"the message\"\n    param2 = 3\n\n    o.on \"test\", (p1, p2) ->\n      equal(p1, param1)\n      equal(p2, param2)\n\n    o.trigger \"test\", param1, param2\n\n  test \"#off\", ->\n    o = Bindable()\n\n    callback = ->\n      ok false\n\n    o.on \"test\", callback\n    # Unbind specific event\n    o.off \"test\", callback\n    o.trigger \"test\"\n\n    o.on \"test\", callback\n    # Unbind all events\n    o.off \"test\"\n    o.trigger \"test\"\n\n  test \"#trigger namespace\", ->\n    o = Bindable()\n    o.on \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.off \".TestNamespace\"\n    o.trigger \"test\"\n\n  test \"#off namespaced\", ->\n    o = Bindable()\n\n    o.on \"test.TestNamespace\", ->\n      ok true\n\n    o.trigger \"test\"\n\n    o.off \".TestNamespace\", ->\n    o.trigger \"test\"\n\n  test \"* events\", ->\n    o = Bindable()\n    \n    called = 0\n    o.on \"*\", (event, rest...) ->\n      called += 1\n      \n      if called is 1\n        assert.equal event, \"edit\"\n        assert.equal rest[0], \"cool\"\n        assert.equal rest[1], 5\n\n    o.trigger \"edit\", \"cool\", 5\n\n    assert.equal called, 1\n",
      "mode": "100644",
      "type": "blob"
    }
  },
  "distribution": {
    "README": {
      "path": "README",
      "content": "(function() {\n  var remove,\n    __slice = [].slice;\n\n  module.exports = function(I, self) {\n    var eventCallbacks;\n    if (I == null) {\n      I = {};\n    }\n    if (self == null) {\n      self = {};\n    }\n    eventCallbacks = {};\n    self.on = function(namespacedEvent, callback) {\n      var event, namespace, _ref;\n      _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n      if (namespace) {\n        callback.__PIXIE || (callback.__PIXIE = {});\n        callback.__PIXIE[namespace] = true;\n      }\n      eventCallbacks[event] || (eventCallbacks[event] = []);\n      eventCallbacks[event].push(callback);\n      return self;\n    };\n    self.off = function(namespacedEvent, callback) {\n      var callbacks, event, key, namespace, _ref;\n      _ref = namespacedEvent.split(\".\"), event = _ref[0], namespace = _ref[1];\n      if (event) {\n        eventCallbacks[event] || (eventCallbacks[event] = []);\n        if (namespace) {\n          eventCallbacks[event] = eventCallbacks.filter(function(callback) {\n            var _ref1;\n            return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n          });\n        } else {\n          if (callback) {\n            remove(eventCallbacks[event], callback);\n          } else {\n            eventCallbacks[event] = [];\n          }\n        }\n      } else if (namespace) {\n        for (key in eventCallbacks) {\n          callbacks = eventCallbacks[key];\n          eventCallbacks[key] = callbacks.filter(function(callback) {\n            var _ref1;\n            return ((_ref1 = callback.__PIXIE) != null ? _ref1[namespace] : void 0) == null;\n          });\n        }\n      }\n      return self;\n    };\n    self.trigger = function() {\n      var event, parameters;\n      event = arguments[0], parameters = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n      (eventCallbacks[\"*\"] || []).forEach(function(callback) {\n        return callback.apply(self, [event].concat(parameters));\n      });\n      if (event !== \"*\") {\n        (eventCallbacks[event] || []).forEach(function(callback) {\n          return callback.apply(self, parameters);\n        });\n      }\n      return self;\n    };\n    return self;\n  };\n\n  remove = function(array, value) {\n    var index;\n    index = array.indexOf(value);\n    if (index >= 0) {\n      return array.splice(index, 1)[0];\n    }\n  };\n\n}).call(this);\n",
      "type": "blob"
    },
    "pixie": {
      "path": "pixie",
      "content": "module.exports = {\"entryPoint\":\"README\",\"version\":\"0.3.0\"};",
      "type": "blob"
    },
    "test/bindable": {
      "path": "test/bindable",
      "content": "(function() {\n  var Bindable, equal, ok, test,\n    __slice = [].slice;\n\n  test = it;\n\n  ok = assert;\n\n  equal = assert.equal;\n\n  Bindable = require(\"../README\");\n\n  describe(\"Bindable\", function() {\n    test(\"#on and #trigger\", function() {\n      var o;\n      o = Bindable();\n      o.on(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"Multiple bindings\", function() {\n      var o;\n      o = Bindable();\n      o.on(\"test\", function() {\n        return ok(true);\n      });\n      o.on(\"test\", function() {\n        return ok(true);\n      });\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger arguments\", function() {\n      var o, param1, param2;\n      o = Bindable();\n      param1 = \"the message\";\n      param2 = 3;\n      o.on(\"test\", function(p1, p2) {\n        equal(p1, param1);\n        return equal(p2, param2);\n      });\n      return o.trigger(\"test\", param1, param2);\n    });\n    test(\"#off\", function() {\n      var callback, o;\n      o = Bindable();\n      callback = function() {\n        return ok(false);\n      };\n      o.on(\"test\", callback);\n      o.off(\"test\", callback);\n      o.trigger(\"test\");\n      o.on(\"test\", callback);\n      o.off(\"test\");\n      return o.trigger(\"test\");\n    });\n    test(\"#trigger namespace\", function() {\n      var o;\n      o = Bindable();\n      o.on(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.off(\".TestNamespace\");\n      return o.trigger(\"test\");\n    });\n    test(\"#off namespaced\", function() {\n      var o;\n      o = Bindable();\n      o.on(\"test.TestNamespace\", function() {\n        return ok(true);\n      });\n      o.trigger(\"test\");\n      o.off(\".TestNamespace\", function() {});\n      return o.trigger(\"test\");\n    });\n    return test(\"* events\", function() {\n      var called, o;\n      o = Bindable();\n      called = 0;\n      o.on(\"*\", function() {\n        var event, rest;\n        event = arguments[0], rest = 2 <= arguments.length ? __slice.call(arguments, 1) : [];\n        called += 1;\n        if (called === 1) {\n          assert.equal(event, \"edit\");\n          assert.equal(rest[0], \"cool\");\n          return assert.equal(rest[1], 5);\n        }\n      });\n      o.trigger(\"edit\", \"cool\", 5);\n      return assert.equal(called, 1);\n    });\n  });\n\n}).call(this);\n",
      "type": "blob"
    }
  },
  "progenitor": {
    "url": "https://danielx.net/editor/"
  },
  "config": {
    "entryPoint": "README",
    "version": "0.3.0"
  },
  "version": "0.3.0",
  "entryPoint": "README",
  "repository": {
    "branch": "master",
    "default_branch": "master",
    "full_name": "distri/bindable",
    "homepage": null,
    "description": "Event binding",
    "html_url": "https://github.com/distri/bindable",
    "url": "https://api.github.com/repos/distri/bindable",
    "publishBranch": "gh-pages"
  },
  "dependencies": {}
});