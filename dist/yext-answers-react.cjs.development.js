'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fetch = _interopDefault(require('cross-fetch'));
var React = require('react');
var React__default = _interopDefault(React);
var useQueryParams = require('use-query-params');
var RecentSearches = _interopDefault(require('recent-searches'));

/**
 * Provides methods for executing searches, submitting questions, and performing autocompletes.
 *
 * @public
 */
var AnswersCore = /** @class */ (function () {
    /** @internal */
    function AnswersCore(searchService, questionSubmissionService, autoCompleteService) {
        this.searchService = searchService;
        this.questionSubmissionService = questionSubmissionService;
        this.autoCompleteService = autoCompleteService;
    }
    /**
     * Performs an Answers search across all verticals.
     *
     * @remarks
     * If rejected, the reason will be an {@link AnswersError}.
     *
     * @param request - Universal search request options
     */
    AnswersCore.prototype.universalSearch = function (request) {
        return this.searchService.universalSearch(request);
    };
    /**
     * Performs an Answers search for a single vertical.
     *
     * @remarks
     * If rejected, the reason will be an {@link AnswersError}.
     *
     * @param request - Vertical search request options
     */
    AnswersCore.prototype.verticalSearch = function (request) {
        return this.searchService.verticalSearch(request);
    };
    /**
     * Submits a custom question to the Answers API.
     *
     * @remarks
     * If rejected, the reason will be an {@link AnswersError}.
     *
     * @param request - Question submission request options
     */
    AnswersCore.prototype.submitQuestion = function (request) {
        return this.questionSubmissionService.submitQuestion(request);
    };
    /**
     * Performs an autocomplete request across all verticals.
     *
     * @remarks
     * If rejected, the reason will be an {@link AnswersError}.
     *
     * @param request - Universal autocomplete request options
     */
    AnswersCore.prototype.universalAutocomplete = function (request) {
        return this.autoCompleteService.universalAutocomplete(request);
    };
    /**
     * Performs an autocomplete request for a single vertical.
     *
     * @remarks
     * If rejected, the reason will be an {@link AnswersError}.
     *
     * @param request - Vertical autocomplete request options
     */
    AnswersCore.prototype.verticalAutocomplete = function (request) {
        return this.autoCompleteService.verticalAutocomplete(request);
    };
    /**
     * Performs a filtersearch request against specified fields within a single vertical.
     *
     * @remarks
     * This differs from the vertical autocomplete because the vertical autocomplete operates on all entity fields whereas
     * filtersearch operates only on specified fields. If rejected, the reason will be an {@link AnswersError}.
     *
     * @example
     * A site has a 'products' vertical and would like a way to allow the user to narrow down the results by the product name.
     * The site can add a second search bar powered by filtersearch which will include only product names as search
     * suggestions.
     *
     * @param request - filtersearch request options
     */
    AnswersCore.prototype.filterSearch = function (request) {
        return this.autoCompleteService.filterSearch(request);
    };
    return AnswersCore;
}());

function createFilter(filter) {
    var fieldId = Object.keys(filter)[0];
    var matcher = Object.keys(filter[fieldId])[0];
    return {
        fieldId: fieldId,
        matcher: matcher,
        value: filter[fieldId][matcher]
    };
}

function createFacets(facets) {
    if (!facets) {
        return [];
    }
    return facets.map(function (facet) { return ({
        fieldId: facet.fieldId,
        displayName: facet.displayName,
        options: createFacetOptions(facet.options)
    }); });
}
function createFacetOptions(options) {
    return options.map(function (option) {
        var filter = createFilter(option.filter);
        return {
            displayName: option.displayName,
            count: option.count,
            selected: option.selected,
            matcher: filter.matcher,
            value: filter.value
        };
    });
}

function createLocationBias(data) {
    return {
        latitude: data.latitude,
        longitude: data.longitude,
        displayName: data.locationDisplayName,
        method: data.accuracy
    };
}

function createSpellCheck(data) {
    return {
        originalQuery: data.originalQuery,
        correctedQuery: data.correctedQuery.value,
        type: data.type,
    };
}

/**
 * Represents the source of a {@link Result}.
 *
 * @public
 */
var Source;
(function (Source) {
    /** The result is from an Answers Knowledge Graph. */
    Source["KnowledgeManager"] = "KNOWLEDGE_MANAGER";
    /** The result is from Google Custom Search Engine. */
    Source["Google"] = "GOOGLE_CSE";
    /** The result is from Bing Search Engine. */
    Source["Bing"] = "BING_CSE";
    /** The result is from Zendesk. */
    Source["Zendesk"] = "ZENDESK";
    /** The result is from Algolia. */
    Source["Algolia"] = "ALGOLIA";
    /** The result was from a generic source. */
    Source["Generic"] = "GENERIC";
})(Source || (Source = {}));

/**
 * A factory which creates results from different sources
 */
var ResultsFactory = /** @class */ (function () {
    function ResultsFactory() {
    }
    ResultsFactory.create = function (results, source) {
        var _this = this;
        if (!results) {
            return [];
        }
        return results.map(function (result, index) {
            var resultIndex = index + 1;
            switch (source) {
                case Source.KnowledgeManager:
                    return _this.fromKnowledgeManager(result, resultIndex);
                case Source.Google:
                    return _this.fromGoogleCustomSearchEngine(result, resultIndex);
                case Source.Bing:
                    return _this.fromBingCustomSearchEngine(result, resultIndex);
                case Source.Zendesk:
                    return _this.fromZendeskSearchEngine(result, resultIndex);
                case Source.Algolia:
                    return _this.fromAlgoliaSearchEngine(result, resultIndex);
                default:
                    return _this.fromGeneric(result, resultIndex);
            }
        });
    };
    ResultsFactory.fromKnowledgeManager = function (result, index) {
        var _a;
        var rawData = (_a = result.data) !== null && _a !== void 0 ? _a : result;
        return {
            rawData: rawData,
            source: Source.KnowledgeManager,
            index: index,
            name: rawData.name,
            description: rawData.description,
            link: rawData.website,
            id: rawData.id,
            distance: result.distance,
            distanceFromFilter: result.distanceFromFilter,
            highlightedFields: result.highlightedFields,
            entityType: rawData.type
        };
    };
    ResultsFactory.fromGoogleCustomSearchEngine = function (result, index) {
        var _a;
        var rawData = (_a = result.data) !== null && _a !== void 0 ? _a : result;
        return {
            rawData: rawData,
            source: Source.Google,
            index: index,
            name: rawData.htmlTitle.replace(/(<([^>]+)>)/ig, ''),
            description: rawData.htmlSnippet,
            link: rawData.link
        };
    };
    ResultsFactory.fromBingCustomSearchEngine = function (result, index) {
        var _a;
        var rawData = (_a = result.data) !== null && _a !== void 0 ? _a : result;
        return {
            rawData: rawData,
            source: Source.Bing,
            index: index,
            name: rawData.name,
            description: rawData.snippet,
            link: rawData.url
        };
    };
    ResultsFactory.fromZendeskSearchEngine = function (result, index) {
        var _a;
        var rawData = (_a = result.data) !== null && _a !== void 0 ? _a : result;
        return {
            rawData: rawData,
            source: Source.Zendesk,
            index: index,
            name: rawData.title,
            description: rawData.snippet,
            link: rawData.html_url
        };
    };
    ResultsFactory.fromAlgoliaSearchEngine = function (result, index) {
        var _a;
        var rawData = (_a = result.data) !== null && _a !== void 0 ? _a : result;
        return {
            rawData: rawData,
            source: Source.Algolia,
            index: index,
            name: rawData.name,
            id: rawData.objectID
        };
    };
    ResultsFactory.fromGeneric = function (result, index) {
        var _a;
        var rawData = (_a = result.data) !== null && _a !== void 0 ? _a : result;
        return {
            rawData: rawData,
            source: Source.Generic,
            index: index,
            name: rawData.name,
            description: rawData.description,
            link: rawData.website,
            id: rawData.id
        };
    };
    ResultsFactory.fromDirectAnswer = function (result) {
        var _a;
        var rawData = (_a = result.fieldValues) !== null && _a !== void 0 ? _a : {};
        return {
            rawData: rawData,
            source: Source.KnowledgeManager,
            name: rawData.name,
            description: rawData.description,
            link: result.website,
            id: result.id,
            entityType: result.type,
        };
    };
    return ResultsFactory;
}());

function createAppliedQueryFilter(data) {
    return {
        displayKey: data.displayKey,
        displayValue: data.displayValue,
        filter: createFilter(data.filter),
        details: data.details
    };
}

function createVerticalResults(data) {
    console.log("createVerticalResults data: ", data);
    console.log("createVerticalResults: ", data.appliedQueryFilters);
    var appliedQueryFilters = data.appliedQueryFilters
        ? data.appliedQueryFilters.map(createAppliedQueryFilter)
        : [];
    return {
        appliedQueryFilters: appliedQueryFilters,
        queryDurationMillis: data.queryDurationMillis,
        results: ResultsFactory.create(data.results, data.source),
        resultsCount: data.resultsCount,
        source: data.source,
        verticalKey: data.verticalConfigId,
    };
}

function createVerticalSearchResponse(data) {
    var _a;
    if (!data.response) {
        throw new Error('The search data does not contain a response property');
    }
    console.log("createVerticalSearchResponse:", data.response);
    return {
        verticalResults: createVerticalResults(data.response),
        queryId: data.response.queryId,
        searchIntents: data.response.searchIntents,
        facets: createFacets(data.response.facets),
        spellCheck: data.response.spellCheck && createSpellCheck(data.response.spellCheck),
        locationBias: data.response.locationBias && createLocationBias(data.response.locationBias),
        allResultsForVertical: data.response.allResultsForVertical
            && createVerticalSearchResponse({ response: data.response.allResultsForVertical }),
        alternativeVerticals: data.response.alternativeVerticals && data.response.alternativeVerticals.modules
            && data.response.alternativeVerticals.modules.map(createVerticalResults),
        uuid: (_a = data.meta) === null || _a === void 0 ? void 0 : _a.uuid
    };
}

var defaultApiVersion = 20190101;
var defaultEndpoints = {
    universalSearch: 'https://liveapi.yext.com/v2/accounts/me/answers/query',
    verticalSearch: 'https://liveapi.yext.com/v2/accounts/me/answers/vertical/query',
    questionSubmission: 'https://api.yext.com/v2/accounts/me/createQuestion',
    status: 'https://answersstatus.pagescdn.com',
    universalAutocomplete: 'https://liveapi-cached.yext.com/v2/accounts/me/answers/autocomplete',
    verticalAutocomplete: 'https://liveapi-cached.yext.com/v2/accounts/me/answers/vertical/autocomplete',
    filterSearch: 'https://liveapi-cached.yext.com/v2/accounts/me/answers/filtersearch',
};

/**
 * The source of the search request.
 *
 * @public
 */
var QuerySource;
(function (QuerySource) {
    /**
     * Indicates that the query was initiated from a standard Answers integration.
     */
    QuerySource["Standard"] = "STANDARD";
    /**
     * Indicates that the query was initaited from an Answers Overlay.
     */
    QuerySource["Overlay"] = "OVERLAY";
})(QuerySource || (QuerySource = {}));

/**
 * Represents the type of direct answer.
 *
 * @public
 */
var DirectAnswerType;
(function (DirectAnswerType) {
    /** Indicates that the DirectAnswer is a {@link FeaturedSnippetDirectAnswer}. */
    DirectAnswerType["FeaturedSnippet"] = "FEATURED_SNIPPET";
    /** Indicates that the DirectAnswer is a {@link FieldValueDirectAnswer}. */
    DirectAnswerType["FieldValue"] = "FIELD_VALUE";
})(DirectAnswerType || (DirectAnswerType = {}));

function createDirectAnswer(data) {
    var isFieldValueDirectAnswer = (data === null || data === void 0 ? void 0 : data.type) === DirectAnswerType.FieldValue;
    var isFeaturedSnippetDirectAnswer = (data === null || data === void 0 ? void 0 : data.type) === DirectAnswerType.FeaturedSnippet;
    if (isFieldValueDirectAnswer) {
        return {
            type: DirectAnswerType.FieldValue,
            value: data.answer.value,
            relatedResult: ResultsFactory.fromDirectAnswer(data.relatedItem.data),
            verticalKey: data.relatedItem.verticalConfigId,
            entityName: data.answer.entityName,
            fieldName: data.answer.fieldName,
            fieldApiName: data.answer.fieldApiName,
            fieldType: data.answer.fieldType
        };
    }
    else if (isFeaturedSnippetDirectAnswer) {
        return {
            type: DirectAnswerType.FeaturedSnippet,
            value: data.answer.value,
            relatedResult: ResultsFactory.fromDirectAnswer(data.relatedItem.data),
            verticalKey: data.relatedItem.verticalConfigId,
            snippet: data.answer.snippet,
        };
    }
    else {
        throw new Error('The Answers API returned an unknown direct answer type');
    }
}

function createUniversalSearchResponse(data) {
    var verticalResults = Array.isArray(data.response.modules)
        ? data.response.modules.map(createVerticalResults)
        : [];
    console.log("createUniversalSearchResponse:", data.response);
    return {
        verticalResults: verticalResults,
        queryId: data.response.queryId,
        directAnswer: data.response.directAnswer && createDirectAnswer(data.response.directAnswer),
        searchIntents: data.response.searchIntents,
        spellCheck: data.response.spellCheck && createSpellCheck(data.response.spellCheck),
        locationBias: data.response.locationBias && createLocationBias(data.response.locationBias),
        uuid: data.meta.uuid
    };
}

function serializeStaticFilters(filter) {
    if (isCombinedFilter(filter)) {
        return JSON.stringify(shapeCombinedFilterForApi(filter));
    }
    return JSON.stringify(shapeFilterForApi(filter));
}
function shapeCombinedFilterForApi(combinedFilter) {
    var _a;
    var shapedFilters = [];
    for (var _i = 0, _b = combinedFilter.filters; _i < _b.length; _i++) {
        var filter = _b[_i];
        if (isCombinedFilter(filter)) {
            shapedFilters.push(shapeCombinedFilterForApi(filter));
        }
        else {
            shapedFilters.push(shapeFilterForApi(filter));
        }
    }
    return shapedFilters.length === 1
        ? shapedFilters[0]
        : (_a = {}, _a[combinedFilter.combinator] = shapedFilters, _a);
}
function shapeFilterForApi(filter) {
    var _a, _b;
    return _a = {},
        _a[filter.fieldId] = (_b = {},
            _b[filter.matcher] = filter.value,
            _b),
        _a;
}
function isCombinedFilter(filter) {
    return (filter.filters !== undefined)
        && (filter.combinator !== undefined);
}

var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function serializeFacets(filters) {
    return JSON.stringify(filters.reduce(function (obj, facet) {
        var fieldId = facet.fieldId;
        var shapedFacets = shapeFacetOptionArrayForApi(facet.options, fieldId);
        obj[fieldId] = shapedFacets;
        return obj;
    }, {}));
}
function shapeFacetOptionArrayForApi(options, fieldId) {
    return options.map(function (option) {
        return shapeFilterForApi(__assign(__assign({}, option), { fieldId: fieldId }));
    });
}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
 * The implementation of SearchService which hits LiveAPI.
 *
 * @internal
 */
var SearchServiceImpl = /** @class */ (function () {
    function SearchServiceImpl(config, httpService, apiResponseValidator) {
        var _a, _b, _c, _d;
        this.config = config;
        this.httpService = httpService;
        this.apiResponseValidator = apiResponseValidator;
        this.universalSearchEndpoint = (_b = (_a = config.endpoints) === null || _a === void 0 ? void 0 : _a.universalSearch) !== null && _b !== void 0 ? _b : defaultEndpoints.universalSearch;
        this.verticalSearchEndpoint = (_d = (_c = config.endpoints) === null || _c === void 0 ? void 0 : _c.verticalSearch) !== null && _d !== void 0 ? _d : defaultEndpoints.verticalSearch;
    }
    SearchServiceImpl.prototype.universalSearch = function (request) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, response, validationResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.injectToStringMethods(request);
                        queryParams = {
                            input: request.query,
                            experienceKey: this.config.experienceKey,
                            api_key: this.config.apiKey,
                            v: defaultApiVersion,
                            version: this.config.experienceVersion,
                            location: (_a = request.location) === null || _a === void 0 ? void 0 : _a.toString(),
                            locale: this.config.locale,
                            skipSpellCheck: request.skipSpellCheck,
                            sessionTrackingEnabled: request.sessionTrackingEnabled,
                            queryTrigger: request.queryTrigger,
                            context: JSON.stringify(request.context || undefined),
                            referrerPageUrl: request.referrerPageUrl,
                            source: request.querySource || QuerySource.Standard
                        };
                        return [4 /*yield*/, this.httpService.get(this.universalSearchEndpoint, queryParams)];
                    case 1:
                        response = _b.sent();
                        validationResult = this.apiResponseValidator.validate(response);
                        if (validationResult instanceof Error) {
                            return [2 /*return*/, Promise.reject(validationResult)];
                        }
                        return [2 /*return*/, createUniversalSearchResponse(response)];
                }
            });
        });
    };
    SearchServiceImpl.prototype.verticalSearch = function (request) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var queryParams, response, validationResult;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.injectToStringMethods(request);
                        queryParams = {
                            experienceKey: this.config.experienceKey,
                            api_key: this.config.apiKey,
                            v: defaultApiVersion,
                            version: this.config.experienceVersion,
                            locale: this.config.locale,
                            input: request.query,
                            location: (_a = request.location) === null || _a === void 0 ? void 0 : _a.toString(),
                            verticalKey: request.verticalKey,
                            filters: request.staticFilters && serializeStaticFilters(request.staticFilters),
                            limit: request.limit,
                            offset: request.offset,
                            retrieveFacets: request.retrieveFacets,
                            facetFilters: request.facets && serializeFacets(request.facets),
                            skipSpellCheck: request.skipSpellCheck,
                            queryTrigger: request.queryTrigger,
                            sessionTrackingEnabled: request.sessionTrackingEnabled,
                            sortBys: JSON.stringify(request.sortBys || []),
                            context: JSON.stringify(request.context || undefined),
                            referrerPageUrl: request.referrerPageUrl,
                            source: request.querySource || QuerySource.Standard,
                            locationRadius: (_b = request.locationRadius) === null || _b === void 0 ? void 0 : _b.toString(),
                            queryId: request.queryId
                        };
                        return [4 /*yield*/, this.httpService.get(this.verticalSearchEndpoint, queryParams)];
                    case 1:
                        response = _c.sent();
                        validationResult = this.apiResponseValidator.validate(response);
                        if (validationResult instanceof Error) {
                            return [2 /*return*/, Promise.reject(validationResult)];
                        }
                        return [2 /*return*/, createVerticalSearchResponse(response)];
                }
            });
        });
    };
    /**
     * Injects toString() methods into the request objects that require them
     */
    SearchServiceImpl.prototype.injectToStringMethods = function (request) {
        if (request.location) {
            request.location.toString = function () {
                return this.latitude + "," + this.longitude;
            };
        }
    };
    return SearchServiceImpl;
}());

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator$1 = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
 * An implementation of QuestionSubmissionService which hits LiveAPI.
 *
 * @internal
 */
var QuestionSubmissionServiceImpl = /** @class */ (function () {
    function QuestionSubmissionServiceImpl(config, httpService, apiResponseValidator) {
        var _a, _b;
        this.config = config;
        this.httpService = httpService;
        this.apiResponseValidator = apiResponseValidator;
        this.endpoint = (_b = (_a = this.config.endpoints) === null || _a === void 0 ? void 0 : _a.questionSubmission) !== null && _b !== void 0 ? _b : defaultEndpoints.questionSubmission;
    }
    QuestionSubmissionServiceImpl.prototype.submitQuestion = function (request) {
        return __awaiter$1(this, void 0, void 0, function () {
            var queryParams, body, requestInit, response, validationResult;
            return __generator$1(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryParams = {
                            v: defaultApiVersion,
                            api_key: this.config.apiKey,
                            sessionTrackingEnabled: request.sessionTrackingEnabled
                        };
                        body = {
                            email: request.email,
                            entityId: request.entityId,
                            name: request.name,
                            questionDescription: request.questionDescription,
                            questionLanguage: this.config.locale,
                            questionText: request.questionText,
                            site: 'FIRSTPARTY'
                        };
                        requestInit = {
                            mode: 'cors',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                        return [4 /*yield*/, this.httpService.post(this.endpoint, queryParams, body, requestInit)];
                    case 1:
                        response = _a.sent();
                        validationResult = this.apiResponseValidator.validate(response);
                        if (validationResult instanceof Error) {
                            return [2 /*return*/, Promise.reject(validationResult)];
                        }
                        return [2 /*return*/, {
                                uuid: response.meta.uuid
                            }];
                }
            });
        });
    };
    return QuestionSubmissionServiceImpl;
}());

/**
 * Updates a url with the given params.
 */
function addParamsToURL(url, params) {
    var parsedUrl = new URL(url);
    var urlParams = new URLSearchParams(parsedUrl.search.substring(1));
    var sanitizedParams = sanitizeQueryParams(params);
    for (var key in sanitizedParams) {
        urlParams.append(key, sanitizedParams[key].toString());
    }
    var updatedUrl = parsedUrl.origin + parsedUrl.pathname;
    var paramsString = urlParams.toString();
    if (paramsString) {
        updatedUrl += '?' + paramsString;
    }
    return updatedUrl;
}
function sanitizeQueryParams(params) {
    Object.keys(params).forEach(function (key) {
        if (params[key] === undefined || params[key] === null) {
            delete params[key];
        }
    });
    return params;
}

var __assign$1 = (undefined && undefined.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
/**
 * Available HTTP request methods
 */
var RequestMethods;
(function (RequestMethods) {
    RequestMethods["GET"] = "get";
    RequestMethods["POST"] = "post";
})(RequestMethods || (RequestMethods = {}));
/**
 * HttpServiceImpl is a wrapper around the native implementation of AJAX
 * related matters.
 */
var HttpServiceImpl = /** @class */ (function () {
    function HttpServiceImpl() {
    }
    /**
     * Perform a GET request
     */
    HttpServiceImpl.prototype.get = function (url, queryParams, options) {
        var reqInitWithMethod = __assign$1({ method: RequestMethods.GET }, options);
        return this.fetch(url, queryParams, reqInitWithMethod)
            .then(function (res) { return res.json(); });
    };
    /**
     * Perform a POST request
     */
    HttpServiceImpl.prototype.post = function (url, queryParams, body, reqInit) {
        var sanitizedBodyParams = sanitizeQueryParams(body);
        var reqInitWithMethodAndBody = __assign$1({ method: RequestMethods.POST, body: JSON.stringify(sanitizedBodyParams) }, reqInit);
        return this.fetch(url, queryParams, reqInitWithMethodAndBody)
            .then(function (res) { return res.json(); });
    };
    /**
     * Perform a fetch, using the polyfill if needed.
     */
    HttpServiceImpl.prototype.fetch = function (url, queryParams, reqInit) {
        var urlWithParams = addParamsToURL(url, queryParams);
        return fetch(urlWithParams, reqInit);
    };
    return HttpServiceImpl;
}());

function createAutocompleteResult(result) {
    var relatedItem = result.relatedItem
        ? ResultsFactory.create([result.relatedItem], Source.KnowledgeManager)[0]
        : result.relatedItem;
    return {
        filter: result.filter && createFilter(result.filter),
        key: result.key,
        matchedSubstrings: result.matchedSubstrings || [],
        value: result.value,
        relatedItem: relatedItem
    };
}

function createAutocompleteResponse(data) {
    if (!data.response) {
        throw new Error('The autocomplete data does not contain a response property');
    }
    if (!Object.keys(data.response).length) {
        throw new Error('The autocomplete response is empty');
    }
    var response = data.response;
    var responseResults = response.results.map(createAutocompleteResult);
    var inputIntents = response.input ? response.input.queryIntents : [];
    return {
        results: responseResults,
        queryId: response.queryId,
        inputIntents: inputIntents || [],
        uuid: data.meta.uuid
    };
}
function createFilterSearchResponse(data) {
    if (!data.response) {
        throw new Error('The autocomplete data does not contain a response property');
    }
    if (!Object.keys(data.response).length) {
        throw new Error('The autocomplete response is empty');
    }
    var response = data.response;
    var isSectioned = false;
    var sections = [];
    var responseResults = [];
    // a filtersearch response may have a sections object
    if (response.sections) {
        isSectioned = true;
        sections = response.sections.map(function (section) { return ({
            label: section.label,
            results: section.results.map(createAutocompleteResult)
        }); });
    }
    else {
        responseResults = response.results.map(createAutocompleteResult);
    }
    var inputIntents = response.input ? response.input.queryIntents : [];
    return {
        sectioned: isSectioned,
        sections: sections,
        results: responseResults,
        queryId: response.queryId,
        inputIntents: inputIntents || [],
        uuid: data.meta.uuid
    };
}

var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator$2 = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
* A service that performs query suggestions.
*/
var AutocompleteServiceImpl = /** @class */ (function () {
    function AutocompleteServiceImpl(config, httpRequester, apiResponseValidator) {
        var _a, _b, _c, _d, _e, _f;
        this.config = config;
        this.httpService = httpRequester;
        this.apiResponseValidator = apiResponseValidator;
        this.universalEndpoint = (_b = (_a = this.config.endpoints) === null || _a === void 0 ? void 0 : _a.universalAutocomplete) !== null && _b !== void 0 ? _b : defaultEndpoints.universalAutocomplete;
        this.verticalEndpoint = (_d = (_c = this.config.endpoints) === null || _c === void 0 ? void 0 : _c.verticalAutocomplete) !== null && _d !== void 0 ? _d : defaultEndpoints.verticalAutocomplete;
        this.filterEndpoint = (_f = (_e = this.config.endpoints) === null || _e === void 0 ? void 0 : _e.filterSearch) !== null && _f !== void 0 ? _f : defaultEndpoints.filterSearch;
    }
    /**
     * Retrieves query suggestions for universal.
     *
     * @param {AutocompleteRequest} request
     * @returns {Promise<AutocompleteResponse>}
     */
    AutocompleteServiceImpl.prototype.universalAutocomplete = function (request) {
        return __awaiter$2(this, void 0, void 0, function () {
            var queryParams, response, validationResult;
            return __generator$2(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryParams = {
                            input: request.input,
                            experienceKey: this.config.experienceKey,
                            api_key: this.config.apiKey,
                            v: defaultApiVersion,
                            version: this.config.experienceVersion,
                            locale: this.config.locale,
                            sessionTrackingEnabled: request.sessionTrackingEnabled
                        };
                        return [4 /*yield*/, this.httpService.get(this.universalEndpoint, queryParams)];
                    case 1:
                        response = _a.sent();
                        validationResult = this.apiResponseValidator.validate(response);
                        if (validationResult instanceof Error) {
                            return [2 /*return*/, Promise.reject(validationResult)];
                        }
                        return [2 /*return*/, createAutocompleteResponse(response)];
                }
            });
        });
    };
    /**
     * Retrieves query suggestions for a vertical.
     *
     * @param {VerticalAutocompleteRequest} request
     * @returns {Promise<AutocompleteResponse>}
     */
    AutocompleteServiceImpl.prototype.verticalAutocomplete = function (request) {
        return __awaiter$2(this, void 0, void 0, function () {
            var queryParams, response, validationResult;
            return __generator$2(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryParams = {
                            input: request.input,
                            experienceKey: this.config.experienceKey,
                            api_key: this.config.apiKey,
                            v: defaultApiVersion,
                            version: this.config.experienceVersion,
                            locale: this.config.locale,
                            verticalKey: request.verticalKey,
                            sessionTrackingEnabled: request.sessionTrackingEnabled
                        };
                        return [4 /*yield*/, this.httpService.get(this.verticalEndpoint, queryParams)];
                    case 1:
                        response = _a.sent();
                        validationResult = this.apiResponseValidator.validate(response);
                        if (validationResult instanceof Error) {
                            return [2 /*return*/, Promise.reject(validationResult)];
                        }
                        return [2 /*return*/, createAutocompleteResponse(response)];
                }
            });
        });
    };
    /**
     * Retrieves query suggestions for filter search.
     *
     * @param {FilterSearchRequest} request
     * @returns {Promise<AutocompleteResponse>}
     */
    AutocompleteServiceImpl.prototype.filterSearch = function (request) {
        return __awaiter$2(this, void 0, void 0, function () {
            var searchParams, queryParams, response, validationResult;
            return __generator$2(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        searchParams = {
                            sectioned: request.sectioned,
                            fields: this.serializeSearchParameterFields(request.fields)
                        };
                        queryParams = {
                            input: request.input,
                            experienceKey: this.config.experienceKey,
                            api_key: this.config.apiKey,
                            v: defaultApiVersion,
                            version: this.config.experienceVersion,
                            locale: this.config.locale,
                            search_parameters: JSON.stringify(searchParams),
                            verticalKey: request.verticalKey,
                            sessionTrackingEnabled: request.sessionTrackingEnabled
                        };
                        return [4 /*yield*/, this.httpService.get(this.filterEndpoint, queryParams)];
                    case 1:
                        response = _a.sent();
                        validationResult = this.apiResponseValidator.validate(response);
                        if (validationResult instanceof Error) {
                            return [2 /*return*/, Promise.reject(validationResult)];
                        }
                        return [2 /*return*/, createFilterSearchResponse(response)];
                }
            });
        });
    };
    AutocompleteServiceImpl.prototype.serializeSearchParameterFields = function (fields) {
        return fields.map(function (_a) {
            var fieldApiName = _a.fieldApiName, entityType = _a.entityType, fetchEntities = _a.fetchEntities;
            return ({
                fieldId: fieldApiName,
                entityTypeId: entityType,
                shouldFetchEntities: fetchEntities
            });
        });
    };
    return AutocompleteServiceImpl;
}());

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Represents an error
 *
 * @remarks
 * If the error originates from the Answer API, the code and type property will be present.
 *
 * @public
 */
var AnswersError = /** @class */ (function (_super) {
    __extends(AnswersError, _super);
    /** @internal */
    function AnswersError(message, code, type) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.code = code;
        _this.type = type;
        return _this;
    }
    return AnswersError;
}(Error));

/**
 * Determines whether or not an API response can be used to construct an answers-core response
 *
 * @internal
 */
var ApiResponseValidator = /** @class */ (function () {
    function ApiResponseValidator() {
    }
    ApiResponseValidator.prototype.validate = function (apiResponse) {
        var testFunctions = [
            this.validateResponseProp,
            this.validateMetaProp,
            this.checkForApiErrors
        ];
        var testResults = testFunctions.map(function (testFn) { return testFn(apiResponse); });
        return testResults.find(function (result) { return result instanceof AnswersError; });
    };
    ApiResponseValidator.prototype.validateResponseProp = function (apiResponse) {
        if (!apiResponse.response) {
            return new AnswersError('Malformed Answers API response: missing response property.');
        }
    };
    ApiResponseValidator.prototype.validateMetaProp = function (apiResponse) {
        if (!apiResponse.meta) {
            return new AnswersError('Malformed Answers API response: missing meta property.');
        }
    };
    ApiResponseValidator.prototype.checkForApiErrors = function (apiResponse) {
        var _a, _b;
        if (((_b = (_a = apiResponse.meta) === null || _a === void 0 ? void 0 : _a.errors) === null || _b === void 0 ? void 0 : _b.length) >= 1) {
            var error = apiResponse.meta.errors[0];
            return new AnswersError(error.message, error.code, error.type);
        }
    };
    return ApiResponseValidator;
}());

/**
 * A Matcher is a filtering operation.
 *
 * @public
 */
var Matcher;
(function (Matcher) {
    /**
     * An equals comparison.
     *
     * @remarks
     * Compatible with all field types.
     */
    Matcher["Equals"] = "$eq";
    /**
     * A not equals comparison.
     *
     * @remarks
     * Compatible with all field types.
     */
    Matcher["NotEquals"] = "!$eq";
    /**
     * A less than comparison.
     *
     * @remarks
     * Compatible with integer, float, date, datetime, and time fields.
     */
    Matcher["LessThan"] = "$lt";
    /**
     * A less than or equal to comparison.
     *
     * @remarks
     * Compatible with integer, float, date, datetime, and time fields.
     */
    Matcher["LessThanOrEqualTo"] = "$le";
    /**
     * A greater than comparison.
     *
     * @remarks
     * Compatible with integer, float, date, datetime, and time fields.
     */
    Matcher["GreaterThan"] = "$gt";
    /**
     * A greater than or equal to comparison.
     *
     * @remarks
     * Compatible with integer, float, date, datetime, and time fields.
     */
    Matcher["GreaterThanOrEqualTo"] = "$ge";
    /**
     * A comparison of whether an entity is within a certain radius of a certain location.
     *
     * @remarks
     * Only compatible with the builtin.location field.
     */
    Matcher["Near"] = "$near";
})(Matcher || (Matcher = {}));

/**
 * Indicates how the filters in a {@link CombinedFilter} should be combined.
 *
 * @public
 */
var FilterCombinator;
(function (FilterCombinator) {
    /** Indicates that filters should be combined with a logical AND. */
    FilterCombinator["AND"] = "$and";
    /** Indicates that filters should be combined with a logical OR. */
    FilterCombinator["OR"] = "$or";
})(FilterCombinator || (FilterCombinator = {}));

/**
 * Describes the ways a search can be executed besides user input.
 *
 * @remarks
 * Used for search analytics. If a user supplied the search query, do not include a QueryTrigger.
 *
 * @example
 * An answers site may be configured to perform a search for 'What services do you offer?' when the page
 * loads. Because that query is a default query rather than a user-supplied query, the Initialize QueryTrigger
 * should be included in the request.
 *
 * @public
 */
var QueryTrigger;
(function (QueryTrigger) {
    /** Indicates that the query was triggered by a default initial search. */
    QueryTrigger["Initialize"] = "initialize";
    /** Indicates that the query was suggested by a {@link SpellCheck} response. */
    QueryTrigger["Suggest"] = "suggest";
})(QueryTrigger || (QueryTrigger = {}));

/**
 * The method of sorting.
 *
 * @public
 */
var SortType;
(function (SortType) {
    /**
     * Sorts based on a field with the direction specified.
     */
    SortType["Field"] = "FIELD";
    /**
     * Sorts based on entity distance alone.
     */
    SortType["EntityDistance"] = "ENTITY_DISTANCE";
    /**
     * Sorts based on relevance according to the algorithm and, when relevant, location bias.
     */
    SortType["Relevance"] = "RELEVANCE";
})(SortType || (SortType = {}));

/**
 * The direction of a sort.
 *
 * @public
 */
var Direction;
(function (Direction) {
    /**
     *  An ascending sort
     *
     * @remarks
     * For numbers this sort is low to high. For text it is alphabetical. For dates it is chronological order.
     */
    Direction["Ascending"] = "ASC";
    /**
     * A descending soft
     *
     * @remarks
     * For numbers this sort is high to low. For text it is reverse alphabetical. For dates it is reverse
     * chronological order.
     */
    Direction["Descending"] = "DESC";
})(Direction || (Direction = {}));

/**
 * The method used to determine the location.
 *
 * @public
 */
var LocationBiasMethod;
(function (LocationBiasMethod) {
    /** Location was determined by IP address. */
    LocationBiasMethod["Ip"] = "IP";
    /**
     * Location was supplied by the user's device.
     *
     * @remarks
     * This location bias method is set when a location is supplied in search requests.
     * */
    LocationBiasMethod["Device"] = "DEVICE";
    /**
     * Location is unknown.
     */
    LocationBiasMethod["Unknown"] = "UNKNOWN";
})(LocationBiasMethod || (LocationBiasMethod = {}));

/**
 * Represents intents from the Answers API.
 *
 * @public
 */
var SearchIntent;
(function (SearchIntent) {
    /** The Answers API is requesting a prompt for the user's location. */
    SearchIntent["NearMe"] = "NEAR_ME";
})(SearchIntent || (SearchIntent = {}));

/**
 * Represents the type of spell check performed.
 *
 * @public
 */
var SpellCheckType;
(function (SpellCheckType) {
    /** The API is suggesting an alternative query. */
    SpellCheckType["Suggest"] = "SUGGEST";
    /** The API is autocorrecting the original query. */
    SpellCheckType["AutoCorrect"] = "AUTOCORRECT";
    /** The API may be doing some combination of suggesting or autocorrecting. */
    SpellCheckType["Combine"] = "COMBINE";
})(SpellCheckType || (SpellCheckType = {}));

/**
 * The entrypoint to the answers-core library.
 *
 * @remarks
 * Returns an {@link AnswersCore} instance.
 *
 * @param config - The answers-core config
 *
 * @public
 */
function provideCore(config) {
    var httpService = new HttpServiceImpl();
    var apiResponseValidator = new ApiResponseValidator();
    var searchService = new SearchServiceImpl(config, httpService, apiResponseValidator);
    var questionSubmissionService = new QuestionSubmissionServiceImpl(config, httpService, apiResponseValidator);
    var autoCompleteService = new AutocompleteServiceImpl(config, httpService, apiResponseValidator);
    return new AnswersCore(searchService, questionSubmissionService, autoCompleteService);
}

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

function createFacets$1(facets) {
  if (!facets) {
    return [];
  }

  return facets.map(function (facet) {
    var fieldId = facet.fieldId ? facet.fieldId : 'emptyFieldId';
    var displayName = facet.fieldId ? facet.fieldId : 'emptyDisplayName';
    var options = facet.options ? createFacetOptions$1(facet.options) : [];
    return {
      fieldId: fieldId,
      displayName: displayName,
      options: options
    };
  });
}

function createFacetOptions$1(options) {
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
  var displayableFacets = createFacets$1(facets); // turn facets into DisplayableFacets

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
  var displayableFacets = createFacets$1(updatedFacets);
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
        var core = provideCore(config);
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

        var _facets = createFacets$1(response.facets); //TODO(tredshaw): all displayable facets set to true


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
          displayableFacets: createFacets$1(returnFacets),
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
      var _res$verticalResults, res;

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
                displayableFacets: createFacets$1(facets)
              });
              _context2.prev = 3;
              _context2.next = 6;
              return core.verticalSearch({
                query: searchTerm,
                context: {},
                verticalKey: verticalKey,
                retrieveFacets: true,
                sortBys: sortBys,
                facets: displayableToSelectedFacets(createFacets$1(facets))
              });

            case 6:
              res = _context2.sent;
              console.log("res.verticalResults.appliedQueryFilters: ", (_res$verticalResults = res.verticalResults) == null ? void 0 : _res$verticalResults.appliedQueryFilters);
              dispatch({
                type: 'UPDATE_APPLIED_QUERY_FILTERS',
                appliedQueryFilters: res.verticalResults.appliedQueryFilters || []
              });
              dispatch({
                type: 'SET_VERTICAL_RESPONSE',
                response: res
              });
              _context2.next = 15;
              break;

            case 12:
              _context2.prev = 12;
              _context2.t0 = _context2["catch"](3);
              dispatch({
                type: 'SET_ERROR',
                error: _context2.t0
              });

            case 15:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[3, 12]]);
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
    var _ref7 = _asyncToGenerator( /*#__PURE__*/runtime_1.mark(function _callee7(facets) {
      var res;
      return runtime_1.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              // do we need this?
              dispatch({
                type: 'UPDATE_FACETS',
                facets: facets || []
              });
              _context7.next = 3;
              return core.verticalSearch({
                query: lastSearchedTerm,
                context: {},
                verticalKey: verticalKey,
                retrieveFacets: true,
                facets: displayableToSelectedFacets(createFacets$1(facets)),
                offset: results.length
              });

            case 3:
              res = _context7.sent;
              dispatch({
                type: 'APPEND_RESULTS',
                results: res.verticalResults.results
              });

            case 5:
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
    var displayFacets = createFacets$1(facets);
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
                  matcher: Matcher.Equals,
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

exports.AnswersContext = AnswersContext;
exports.provideCore = provideCore;
exports.useAnswers = useAnswers;
//# sourceMappingURL=yext-answers-react.cjs.development.js.map
