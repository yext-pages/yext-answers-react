import {
  AutocompleteResult,
  Facet,
  provideCore,
  SortBy,
  VerticalSearchResponse,
  DisplayableFacet,
} from '@yext/answers-core';
import { AnswersConfig } from './AnswersConfig';
import { getFacetFilters, sortFacets } from './facetUtilties';
import { AppliedFilter, InitialStateType } from './initialState';
import { createFacets } from './createFacets';
export type Action =
  | {
      type: 'SET_CONFIGURATION';
      config: AnswersConfig;
      initialState: InitialStateType;
    }
  | { type: 'PREPARE_FOR_SEARCH'; searchTerm: string }
  | { type: 'ON_SEARCH_TERM_CHANGE'; searchTerm: string }
  | { type: 'SET_VERTICAL_RESPONSE'; response: VerticalSearchResponse }
  | {
      type: 'SET_AUTOCOMPLETE';
      querySuggestions: AutocompleteResult[];
      recentSearches: { query: string }[];
    }
  | { type: 'NEXT_AUTOCOMPLETE_OPTION' }
  | { type: 'SET_ERROR'; error: any }
  | { type: 'PREVIOUS_AUTOCOMPLETE_OPTION' }
  | { type: 'APPEND_RESULTS'; results: any[] }
  | { type: 'UPDATE_SORT_BYS'; sortBys?: SortBy[] }
  | { type: 'SIMPLE_FILTER_UPDATE'; simpleFilters?: Facet[] }
  | { type: 'UPDATE_FACETS'; facets: Facet[] }
  | { type: 'UPDATE_DISPLAYABLE_FACETS'; displayableFacets: DisplayableFacet[] }

const reducer = (state: InitialStateType, action: Action): InitialStateType => {
  if (
    (action.type === 'SET_CONFIGURATION' && action.config.debug) ||
    state.debug
  ) {
    console.log(action.type, action);
  }
  const { autocomplete, facetSorter } = state;
  switch (action.type) {
    case 'PREPARE_FOR_SEARCH':
      return {
        ...state,
        loading: true,
        error: false,
        autocomplete: {
          loading: false,
          autocompleteOptions: [],
          recentSearches: [],
          querySuggestions: [],
          selectedIndex: -1,
        },
        lastSearchedTerm: action.searchTerm,
        visibleSearchTerm: action.searchTerm,
        originalSearchTerm: action.searchTerm,
      };
    case 'SET_CONFIGURATION': {
      const { config, initialState } = action;
      const core = provideCore(config);
      return {
        ...state,
        ...initialState,
        core,
        ...config,
        debug: config.debug || false,
      };
    }
    case 'ON_SEARCH_TERM_CHANGE':
      return {
        ...state,
        visibleSearchTerm: action.searchTerm,
        originalSearchTerm: action.searchTerm,
      };
    case 'SET_ERROR':
      if (state.debug) {
        console.log(action.error);
      }
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case 'SET_VERTICAL_RESPONSE': {
      const { response } = action;
      const facets = createFacets(response.facets); //TODO(tredshaw): all displayable facets set to true
      const newFacetFilters = getFacetFilters(facets);
      const facetFilters = [
        ...state.facetFilters.filter(f => {
          const matchedIndex = newFacetFilters.findIndex((g) => {
            return g.fieldId === f.fieldId && g.value === f.value
          }
          );
          return matchedIndex === -1;
        }),
        ...newFacetFilters,
      ];

      const appliedFilters: AppliedFilter[] = [];

      // response.verticalResults.appliedQueryFilters.forEach(q => {
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

      facets.forEach(f => {
        f.options.forEach(o => {
          if (o.selected === true) {
            //  Check if Facet Field Exists
            const matchedIndex = appliedFilters.findIndex(
              af => af.fieldId === f.fieldId
            );
            if (matchedIndex !== -1) {
              appliedFilters[matchedIndex].values.push(o.displayName);
            } else {
              appliedFilters.push({
                displayName: o.displayName,
                fieldId: f.fieldId,
                source: 'FACET',
                values: [o.value.toString()],
              });
            }
          }
        });
      });

      let returnFacets = facetSorter ? facetSorter(facets) : sortFacets(facets);
      return {
        ...state,
        loading: false,
        autocomplete: {
          loading: false,
          autocompleteOptions: [],
          recentSearches: [],
          querySuggestions: [],
          selectedIndex: -1,
        },
        error: false,
        verticalresults: response.verticalResults,
        hasSearched: true,
        results: response.verticalResults.results,
        facets: returnFacets,
        displayableFacets: createFacets(returnFacets),
        appliedFilters,
        facetFilters,
        locationBias: response.locationBias,
        searchIntents: response.searchIntents,
      };
    }
    case 'SET_AUTOCOMPLETE':
      const { querySuggestions, recentSearches } = action;
      return {
        ...state,
        autocomplete: {
          loading: false,
          querySuggestions,
          selectedIndex: -1,
          recentSearches,
          autocompleteOptions: [
            ...recentSearches.map(s => {
              return {
                value: s.query,
                type: 'RECENT',
              };
            }),
            ...querySuggestions
              .filter(q => {
                // Dedupe recent searches
                return !recentSearches.map(s => s.query).includes(q.value);
              })
              .map(s => {
                return {
                  ...s,
                  type: 'SUGGESTION',
                };
              }),
          ].map(s => {
            return {
              ...s,
              key: s.type + s.value,
            };
          }) as { value: string; type: 'RECENT' | 'SUGGESTION'; key: string }[],
        },
      };
    case 'NEXT_AUTOCOMPLETE_OPTION':
      const nextIndex = Math.min(
        autocomplete.autocompleteOptions.length - 1,
        autocomplete.selectedIndex + 1
      );
      return {
        ...state,
        autocomplete: {
          ...autocomplete,
          autocompleteOptions: state.autocomplete.autocompleteOptions.map(
            (o, i) => {
              return {
                ...o,
                highlighted: i === nextIndex,
              };
            }
          ),
          selectedIndex: nextIndex,
        },
        visibleSearchTerm: autocomplete.autocompleteOptions[nextIndex].value,
      };

    case 'PREVIOUS_AUTOCOMPLETE_OPTION':
      const prevIndex = Math.max(-1, autocomplete.selectedIndex - 1);

      const newVisibleSearchTerm =
        prevIndex === -1
          ? state.originalSearchTerm
          : autocomplete.autocompleteOptions[prevIndex].value;

      return {
        ...state,
        autocomplete: {
          ...autocomplete,
          autocompleteOptions: state.autocomplete.autocompleteOptions.map(
            (o, i) => {
              return {
                ...o,
                highlighted: i === prevIndex,
              };
            }
          ),
          selectedIndex: prevIndex,
        },
        visibleSearchTerm: newVisibleSearchTerm,
      };

    case 'APPEND_RESULTS':
      return {
        ...state,
        results: [...state.results, ...action.results],
      };
    case 'UPDATE_SORT_BYS':
      return {
        ...state,
        sortBys: action.sortBys,
      };
    case 'UPDATE_DISPLAYABLE_FACETS':
      const { displayableFacets } = action;
      return {
        ...state,
        displayableFacets: displayableFacets,
      };
    case 'UPDATE_FACETS':
      const { facets } = action;
      return {
        ...state,
        facetFilters: getFacetFilters(facets),
        facets,
      };

    default:
      return state;
  }
};

export default reducer;
