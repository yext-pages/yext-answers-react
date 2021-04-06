import { AnswersCore, AutocompleteResult, Facet, Filter, SortBy, VerticalResults, LocationBias, SearchIntent, DisplayableFacet } from '@yext/answers-core';
declare type AutocompleteState = {
    autocompleteOptions: {
        value: string;
        type: 'RECENT' | 'SUGGESTION';
        key: string;
        highlighted?: boolean;
    }[];
    loading: boolean;
    querySuggestions: AutocompleteResult[];
    recentSearches: {
        query: string;
    }[];
    selectedIndex: number;
};
export declare type AppliedFilter = {
    displayName: string;
    fieldId: string;
    values: string[];
    source: 'FACET' | 'NLP';
};
export declare type InitialStateType = {
    loading: boolean;
    error: any;
    hasSearched: boolean;
    core: AnswersCore;
    verticalKey: string;
    visibleSearchTerm: string;
    lastSearchedTerm: string;
    originalSearchTerm: string;
    verticalresults?: VerticalResults;
    results: any[];
    facets: Facet[];
    displayableFacets: DisplayableFacet[];
    facetFilters: Filter[];
    appliedFilters: AppliedFilter[];
    sortBys?: SortBy[];
    autocomplete: AutocompleteState;
    debug: boolean;
    facetSorter?: (facets: Facet[]) => Facet[];
    locationBias?: LocationBias;
    searchIntents?: SearchIntent[];
};
export declare const initialState: InitialStateType;
export {};
