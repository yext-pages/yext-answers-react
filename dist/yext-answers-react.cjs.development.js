'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var answersCore = require('@yext/answers-core');
var React = require('react');
var React__default = _interopDefault(React);
var useQueryParams = require('use-query-params');
var RecentSearches = _interopDefault(require('recent-searches'));

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var initialState = {
  loading: false,
  error: false,
  //@ts-ignore
  core: undefined,
  hasSearched: false,
  verticalKey: '',
  visibleSearchTerm: '',
  lastSearchedTerm: '',
  originalSearchTerm: '',
  verticalresults: undefined,
  results: [],
  entities: [],
  facets: [],
  displayableFacets: [],
  appliedQueryFilters: [],
  facetFilters: [],
  autocomplete: {
    querySuggestions: [],
    loading: false,
    recentSearches: [],
    autocompleteOptions: [],
    selectedIndex: -1
  },
  debug: false,
  locationBias: undefined,
  searchIntents: []
};

function createFacets(facets) {
  if (!facets) {
    return [];
  }

  return facets.map(function (facet) {
    var fieldId = facet.fieldId ? facet.fieldId : 'emptyFieldId';
    var displayName = facet.fieldId ? facet.fieldId : 'emptyDisplayName';
    var options = facet.options ? createFacetOptions(facet.options) : [];
    return {
      fieldId: fieldId,
      displayName: displayName,
      options: options
    };
  });
}

function createFacetOptions(options) {
  return options.map(function (option) {
    return {
      displayName: option.displayName,
      count: option.count,
      selected: option.selected,
      matcher: option.matcher,
      value: option.value
    };
  });
}

var getFacetFilters = function getFacetFilters(facets) {
  //this needs to return all selected FILTERS - which no longer exist on facet objects
  // theoretically it could just be all of the facets
  var displayableFacets = createFacets(facets); // turn facets into DisplayableFacets

  return displayableFacets.map(function (f) {
    return [].concat(f.options.filter(function (o) {
      return o.selected;
    }).map(function (o) {
      // building a new filter object
      var filter = {
        fieldId: f.fieldId,
        matcher: o.matcher,
        value: o.value
      };
      return filter;
    }));
  }).flat();
};
var toggleFacetObject = function toggleFacetObject(facets, facetFieldId, optionDisplayName) {
  var updatedFacets = [].concat(facets);
  var displayableFacets = createFacets(updatedFacets);
  displayableFacets.forEach(function (f) {
    if (f.fieldId === facetFieldId) {
      f.options.forEach(function (o) {
        if (o.displayName === optionDisplayName) {
          o.selected = !o.selected;
        }
      });
    } else return;
  });
  var filtered = displayableFacets.filter(function (facet) {
    var filter = facet.options.some(function (option) {
      return option.selected;
    });
    return filter;
  });
  filtered.forEach(function (facet) {
    facet.options = facet.options.filter(function (option) {
      return option.selected;
    });
  });
  return filtered;
};
var displayableToSelectedFacets = function displayableToSelectedFacets(displayableFacets) {
  var selectedFacets = displayableFacets.filter(function (facet) {
    var filter = facet.options.some(function (option) {
      return option.selected;
    });
    return filter;
  });
  selectedFacets.forEach(function (facet) {
    facet.options = facet.options.filter(function (option) {
      return option.selected;
    });
  });
  return displayableToFacets(selectedFacets);
};
var displayableToFacets = function displayableToFacets(displayableFacets) {
  var facets = [];
  displayableFacets.forEach(function (displayFacet) {
    facets.push({
      fieldId: displayFacet.fieldId,
      options: displayFacet.options
    });
  });
  return facets;
};
var sortFacets = function sortFacets(facets) {
  //TODO(tredshaw): how are we going to sort Facets/do we even need to anymore
  // this shoudl take Facets and return displayableFacets?
  return facets; // return facets.map(facet => {
  //   console.log(facet)
  //   return {
  //     ...facet,
  //     options: facet.options.sort((a,b) => {
  //       if(a.)
  //     })
  //   }
  // });
  // return facets.map(f => {
  //   return {
  //     ...f,
  //     options: f.options.sort((a, b) => {
  //       if (a.selected && b.selected) return b.count - a.count;
  //       else if (a.selected) return -1;
  //       else if (b.selected) return 1;
  //       else return b.count - a.count;
  //     }),
  //   };
  // });
};

var reducer = function reducer(state, action) {
  if (action.type === 'SET_CONFIGURATION' && action.config.debug || state.debug) {
    console.log(action.type, action);
  }

  var autocomplete = state.autocomplete,
      facetSorter = state.facetSorter;

  switch (action.type) {
    case 'PREPARE_FOR_SEARCH':
      return _extends({}, state, {
        loading: true,
        error: false,
        autocomplete: {
          loading: false,
          autocompleteOptions: [],
          recentSearches: [],
          querySuggestions: [],
          selectedIndex: -1
        },
        lastSearchedTerm: action.searchTerm,
        visibleSearchTerm: action.searchTerm,
        originalSearchTerm: action.searchTerm
      });

    case 'SET_CONFIGURATION':
      {
        var config = action.config,
            initialState = action.initialState;
        var core = answersCore.provideCore(config);
        return _extends({}, state, initialState, {
          core: core
        }, config, {
          debug: config.debug || false
        });
      }

    case 'ON_SEARCH_TERM_CHANGE':
      return _extends({}, state, {
        visibleSearchTerm: action.searchTerm,
        originalSearchTerm: action.searchTerm
      });

    case 'SET_ERROR':
      if (state.debug) {
        console.log(action.error);
      }

      return _extends({}, state, {
        loading: false,
        error: action.error
      });

    case 'SET_VERTICAL_RESPONSE':
      {
        var response = action.response;

        var _facets = createFacets(response.facets); //TODO(tredshaw): all displayable facets set to true


        var newFacetFilters = getFacetFilters(_facets);
        var facetFilters = [].concat(state.facetFilters.filter(function (f) {
          var matchedIndex = newFacetFilters.findIndex(function (g) {
            return g.fieldId === f.fieldId && g.value === f.value;
          });
          return matchedIndex === -1;
        }), newFacetFilters);
        var appliedFilters = []; // response.verticalResults.appliedQueryFilters.forEach(q => {
        //   const isFacet =
        //     facetFilters.findIndex(
        //       f =>
        //         q.filter.fieldId === f.fieldId &&
        //         q.displayValue === f.value
        //     ) === -1;
        //   if (!isFacet) {
        //     console.log('NLP Filter');
        //   }
        // });

        _facets.forEach(function (f) {
          f.options.forEach(function (o) {
            if (o.selected === true) {
              //  Check if Facet Field Exists
              var matchedIndex = appliedFilters.findIndex(function (af) {
                return af.fieldId === f.fieldId;
              });

              if (matchedIndex !== -1) {
                appliedFilters[matchedIndex].values.push(o.displayName);
              } else {
                appliedFilters.push({
                  displayName: o.displayName,
                  fieldId: f.fieldId,
                  source: 'FACET',
                  values: [o.value.toString()]
                });
              }
            }
          });
        });

        var returnFacets = facetSorter ? facetSorter(_facets) : sortFacets(_facets);
        return _extends({}, state, {
          loading: false,
          autocomplete: {
            loading: false,
            autocompleteOptions: [],
            recentSearches: [],
            querySuggestions: [],
            selectedIndex: -1
          },
          error: false,
          verticalresults: response.verticalResults,
          hasSearched: true,
          results: response.verticalResults.results,
          facets: returnFacets,
          displayableFacets: createFacets(returnFacets),
          appliedFilters: appliedFilters,
          facetFilters: facetFilters,
          locationBias: response.locationBias,
          searchIntents: response.searchIntents
        });
      }

    case 'SET_AUTOCOMPLETE':
      var querySuggestions = action.querySuggestions,
          recentSearches = action.recentSearches;
      return _extends({}, state, {
        autocomplete: {
          loading: false,
          querySuggestions: querySuggestions,
          selectedIndex: -1,
          recentSearches: recentSearches,
          autocompleteOptions: [].concat(recentSearches.map(function (s) {
            return {
              value: s.query,
              type: 'RECENT'
            };
          }), querySuggestions.filter(function (q) {
            // Dedupe recent searches
            return !recentSearches.map(function (s) {
              return s.query;
            }).includes(q.value);
          }).map(function (s) {
            return _extends({}, s, {
              type: 'SUGGESTION'
            });
          })).map(function (s) {
            return _extends({}, s, {
              key: s.type + s.value
            });
          })
        }
      });

    case 'NEXT_AUTOCOMPLETE_OPTION':
      var nextIndex = Math.min(autocomplete.autocompleteOptions.length - 1, autocomplete.selectedIndex + 1);
      return _extends({}, state, {
        autocomplete: _extends({}, autocomplete, {
          autocompleteOptions: state.autocomplete.autocompleteOptions.map(function (o, i) {
            return _extends({}, o, {
              highlighted: i === nextIndex
            });
          }),
          selectedIndex: nextIndex
        }),
        visibleSearchTerm: autocomplete.autocompleteOptions[nextIndex].value
      });

    case 'PREVIOUS_AUTOCOMPLETE_OPTION':
      var prevIndex = Math.max(-1, autocomplete.selectedIndex - 1);
      var newVisibleSearchTerm = prevIndex === -1 ? state.originalSearchTerm : autocomplete.autocompleteOptions[prevIndex].value;
      return _extends({}, state, {
        autocomplete: _extends({}, autocomplete, {
          autocompleteOptions: state.autocomplete.autocompleteOptions.map(function (o, i) {
            return _extends({}, o, {
              highlighted: i === prevIndex
            });
          }),
          selectedIndex: prevIndex
        }),
        visibleSearchTerm: newVisibleSearchTerm
      });

    case 'UPDATE_LOCATION_BIAS':
      var locationBias = action.locationBias;
      return _extends({}, state, {
        locationBias: locationBias
      });

    case 'APPEND_RESULTS':
      return _extends({}, state, {
        results: [].concat(state.results, action.results)
      });

    case 'UPDATE_SORT_BYS':
      return _extends({}, state, {
        sortBys: action.sortBys
      });

    case 'UPDATE_DISPLAYABLE_FACETS':
      var displayableFacets = action.displayableFacets;
      return _extends({}, state, {
        displayableFacets: displayableFacets
      });

    case 'UPDATE_APPLIED_QUERY_FILTERS':
      var appliedQueryFilters = action.appliedQueryFilters;
      return _extends({}, state, {
        appliedQueryFilters: appliedQueryFilters
      });

    case 'UPDATE_FACETS':
      var facets = action.facets;
      return _extends({}, state, {
        facetFilters: getFacetFilters(facets),
        facets: facets
      });

    default:
      return state;
  }
};

var AppContext = /*#__PURE__*/React.createContext({
  state: initialState,
  dispatch: function dispatch() {
    return null;
  }
});

var AnswersStore = function AnswersStore(_ref) {
  var children = _ref.children;

  //@ts-ignore
  var _useReducer = React.useReducer(reducer, initialState),
      state = _useReducer[0],
      dispatch = _useReducer[1];

  return React__default.createElement(AppContext.Provider, {
    value: {
      state: state,
      dispatch: dispatch
    }
  }, children);
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime_1 = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var recentSearchesController = /*#__PURE__*/new RecentSearches();
var useAnswers = function useAnswers() {
  var _useContext = React.useContext(AppContext),
      state = _useContext.state,
      dispatch = _useContext.dispatch;

  var lastSearchedTerm = state.lastSearchedTerm,
      visibleSearchTerm = state.visibleSearchTerm,
      facets = state.facets,
      autocomplete = state.autocomplete,
      sortBys = state.sortBys,
      verticalKey = state.verticalKey,
      results = state.results,
      core = state.core;

  var setConfiguration = function setConfiguration(config, initialState) {
    dispatch({
      type: 'SET_CONFIGURATION',
      config: config,
      initialState: initialState
    });
  };

  var runSearch = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee(searchTerm, clearFacets) {
      return runtime_1.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (searchTerm === void 0) {
                searchTerm = visibleSearchTerm;
              }

              if (clearFacets === void 0) {
                clearFacets = true;
              }

              recentSearchesController.setRecentSearch(searchTerm);
              handleSearch(searchTerm, clearFacets ? [] : facets, sortBys);

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function runSearch(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  var chooseAutocompleteOption = function chooseAutocompleteOption(index) {
    var option = autocomplete.autocompleteOptions[index];

    if (option) {
      runSearch(option.value);
    } else {
      console.log('Index does not exist');
    }
  };

  var handleSearch = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee2(searchTerm, facets, sortBys) {
      var res;
      return runtime_1.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              dispatch({
                type: 'PREPARE_FOR_SEARCH',
                searchTerm: searchTerm
              });
              dispatch({
                type: 'UPDATE_FACETS',
                facets: facets || []
              });
              dispatch({
                type: 'UPDATE_DISPLAYABLE_FACETS',
                displayableFacets: createFacets(facets)
              });
              _context2.prev = 3;
              _context2.next = 6;
              return core.verticalSearch({
                query: searchTerm,
                context: {},
                verticalKey: verticalKey,
                retrieveFacets: true,
                sortBys: sortBys,
                facets: displayableToSelectedFacets(createFacets(facets))
              });

            case 6:
              res = _context2.sent;
              dispatch({
                type: 'UPDATE_APPLIED_QUERY_FILTERS',
                appliedQueryFilters: res.verticalResults.appliedQueryFilters || []
              });
              dispatch({
                type: 'SET_VERTICAL_RESPONSE',
                response: res
              });
              _context2.next = 14;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2["catch"](3);
              dispatch({
                type: 'SET_ERROR',
                error: _context2.t0
              });

            case 14:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[3, 11]]);
    }));

    return function handleSearch(_x3, _x4, _x5) {
      return _ref2.apply(this, arguments);
    };
  }();

  var handleLocationBiasSearch = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee3(searchTerm, locationBias, displayableFacets) {
      var location, res;
      return runtime_1.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              dispatch({
                type: 'PREPARE_FOR_SEARCH',
                searchTerm: searchTerm
              });
              _context3.prev = 1;
              location = {
                latitude: locationBias.latitude,
                longitude: locationBias.longitude
              };
              _context3.next = 5;
              return core.verticalSearch({
                query: searchTerm,
                context: {},
                verticalKey: verticalKey,
                retrieveFacets: true,
                sortBys: sortBys,
                facets: displayableToSelectedFacets(displayableFacets),
                location: location
              });

            case 5:
              res = _context3.sent;
              dispatch({
                type: 'SET_VERTICAL_RESPONSE',
                response: res
              });
              _context3.next = 12;
              break;

            case 9:
              _context3.prev = 9;
              _context3.t0 = _context3["catch"](1);
              dispatch({
                type: 'SET_ERROR',
                error: _context3.t0
              });

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[1, 9]]);
    }));

    return function handleLocationBiasSearch(_x6, _x7, _x8) {
      return _ref3.apply(this, arguments);
    };
  }();

  var handleSearchTermChange = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee4(searchTerm) {
      var res;
      return runtime_1.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (searchTerm === void 0) {
                searchTerm = visibleSearchTerm;
              }

              dispatch({
                type: 'ON_SEARCH_TERM_CHANGE',
                searchTerm: searchTerm
              });
              _context4.next = 4;
              return core.verticalAutocomplete({
                input: searchTerm,
                verticalKey: verticalKey
              });

            case 4:
              res = _context4.sent;
              dispatch({
                type: 'SET_AUTOCOMPLETE',
                querySuggestions: res.results,
                recentSearches: recentSearchesController.getRecentSearches(searchTerm)
              });

            case 6:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function handleSearchTermChange(_x9) {
      return _ref4.apply(this, arguments);
    };
  }();

  var updateSortBys = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee5(sortBys, updateSearchResults) {
      return runtime_1.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (updateSearchResults === void 0) {
                updateSearchResults = true;
              }

              dispatch({
                type: 'UPDATE_SORT_BYS',
                sortBys: sortBys
              });

              if (updateSearchResults) {
                handleSearch(lastSearchedTerm, facets, sortBys);
              }

            case 3:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function updateSortBys(_x10, _x11) {
      return _ref5.apply(this, arguments);
    };
  }();

  var toggleFacet = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee6(facetFieldId, optionDisplayName, updateSearchResults) {
      var updatedFacets, regularFacets;
      return runtime_1.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              if (updateSearchResults === void 0) {
                updateSearchResults = true;
              }

              updatedFacets = toggleFacetObject(state.facets, facetFieldId, optionDisplayName);
              dispatch({
                type: 'UPDATE_FACETS',
                facets: displayableToFacets(updatedFacets)
              });
              dispatch({
                type: 'UPDATE_DISPLAYABLE_FACETS',
                displayableFacets: updatedFacets
              }); // let removed = false;

              if (updateSearchResults) {
                regularFacets = displayableToFacets(updatedFacets);
                console.log(regularFacets); //TODO(tredshaw): this sets all facets to selected = true

                handleSearch(lastSearchedTerm, regularFacets, sortBys);
              }

            case 5:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function toggleFacet(_x12, _x13, _x14) {
      return _ref6.apply(this, arguments);
    };
  }();

  var loadMore = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee7(displayableFacets) {
      var res;
      return runtime_1.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return core.verticalSearch({
                query: lastSearchedTerm,
                context: {},
                verticalKey: verticalKey,
                retrieveFacets: true,
                facets: displayableToSelectedFacets(displayableFacets),
                offset: results.length
              });

            case 2:
              res = _context7.sent;
              dispatch({
                type: 'APPEND_RESULTS',
                results: res.verticalResults.results
              });

            case 4:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    return function loadMore(_x15) {
      return _ref7.apply(this, arguments);
    };
  }();

  var nextAutocompleteOption = function nextAutocompleteOption() {
    dispatch({
      type: 'NEXT_AUTOCOMPLETE_OPTION'
    });
  };

  var prevAutocompleteOption = function prevAutocompleteOption() {
    dispatch({
      type: 'PREVIOUS_AUTOCOMPLETE_OPTION'
    });
  };

  var clearSearch = function clearSearch() {
    var displayFacets = createFacets(facets);
    dispatch({
      type: 'ON_SEARCH_TERM_CHANGE',
      searchTerm: ''
    });
    dispatch({
      type: 'UPDATE_FACETS',
      facets: displayFacets.map(function (f) {
        return _extends({}, f, {
          options: f.options.map(function (o) {
            return _extends({}, o, {
              selected: false
            });
          })
        });
      })
    });
    dispatch({
      type: 'UPDATE_SORT_BYS',
      sortBys: undefined
    });
    handleSearch('', undefined, undefined);
  };

  var simpleFilter = /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee8(fieldId, value) {
      var facets;
      return runtime_1.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              if (value === void 0) {
                value = 'test';
              }

              facets = [];
              facets.push({
                fieldId: fieldId,
                options: [{
                  matcher: answersCore.Matcher.Equals,
                  value: value
                }]
              });
              dispatch({
                type: 'SIMPLE_FILTER_UPDATE',
                simpleFilters: facets
              });
              handleSearch(lastSearchedTerm, facets, undefined);

            case 5:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }));

    return function simpleFilter(_x16, _x17) {
      return _ref8.apply(this, arguments);
    };
  }();

  return {
    state: state,
    actions: {
      runSearch: runSearch,
      handleLocationBiasSearch: handleLocationBiasSearch,
      handleSearchTermChange: handleSearchTermChange,
      chooseAutocompleteOption: chooseAutocompleteOption,
      toggleFacet: toggleFacet,
      loadMore: loadMore,
      updateSortBys: updateSortBys,
      setConfiguration: setConfiguration,
      nextAutocompleteOption: nextAutocompleteOption,
      prevAutocompleteOption: prevAutocompleteOption,
      clearSearch: clearSearch,
      simpleFilter: simpleFilter
    }
  };
};

var useQueryParamManager = function useQueryParamManager() {
  var _useAnswers = useAnswers(),
      state = _useAnswers.state;

  var _useQueryParams = useQueryParams.useQueryParams({
    query: useQueryParams.StringParam,
    filters: useQueryParams.JsonParam,
    sortBys: useQueryParams.JsonParam
  }),
      queryParams = _useQueryParams[0],
      setQueryParams = _useQueryParams[1];

  var facetFilters = getFacetFilters(state.facets);
  React.useEffect(function () {
    setQueryParams({
      query: state.lastSearchedTerm || undefined,
      filters: facetFilters.length > 0 ? facetFilters : undefined,
      sortBys: state.sortBys || undefined
    });
  }, [state.lastSearchedTerm, facetFilters]);
  return queryParams;
};

var AnswersContext = function AnswersContext(props) {
  return React__default.createElement(useQueryParams.QueryParamProvider, null, React__default.createElement(AnswersStore, null, React__default.createElement(Inner, Object.assign({}, props))));
};

var Inner = function Inner(_ref) {
  var config = _ref.config,
      children = _ref.children;
  var _config$runSearchOnLo = config.runSearchOnLoad,
      runSearchOnLoad = _config$runSearchOnLo === void 0 ? false : _config$runSearchOnLo;

  var _useAnswers = useAnswers(),
      state = _useAnswers.state,
      _useAnswers$actions = _useAnswers.actions,
      runSearch = _useAnswers$actions.runSearch,
      setConfiguration = _useAnswers$actions.setConfiguration,
      handleSearchTermChange = _useAnswers$actions.handleSearchTermChange;

  var queryParams = useQueryParamManager();
  React.useEffect(function () {
    if (!state.verticalKey) {
      setConfiguration(config, _extends({}, initialState, {
        lastSearchedTerm: queryParams.query || '',
        originalSearchTerm: queryParams.query || '',
        visibleSearchTerm: queryParams.query || '',
        facetFilters: queryParams.filters || [],
        sortBys: queryParams.sortBys
      }));
    }

    if (runSearchOnLoad && state.verticalKey) {
      runSearch(undefined, false);
    }

    if (state.verticalKey) {
      handleSearchTermChange();
    }
  }, [runSearchOnLoad, state.verticalKey]);
  return React__default.createElement(React__default.Fragment, null, children);
};

Object.defineProperty(exports, 'provideCore', {
  enumerable: true,
  get: function () {
    return answersCore.provideCore;
  }
});
exports.AnswersContext = AnswersContext;
exports.useAnswers = useAnswers;
//# sourceMappingURL=yext-answers-react.cjs.development.js.map
