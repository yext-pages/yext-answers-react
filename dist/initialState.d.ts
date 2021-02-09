import { AnswersCore, AutoCompleteResult, Facet, SimpleFilter, SortBy, VerticalResults } from '@yext/answers-core';
declare type AutocompleteState = {
    autocompleteOptions: {
        value: string;
        type: 'RECENT' | 'SUGGESTION';
        key: string;
        highlighted?: boolean;
    }[];
    loading: boolean;
    querySuggestions: AutoCompleteResult[];
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
    facetFilters: SimpleFilter[];
    appliedFilters: AppliedFilter[];
    sortBys?: SortBy[];
    autocomplete: AutocompleteState;
    debug: boolean;
    facetSorter?: (facets: Facet[]) => Facet[];
};
export declare const initialState: InitialStateType;
export {};
