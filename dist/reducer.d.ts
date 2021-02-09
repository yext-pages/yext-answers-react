import { AutoCompleteResult, Facet, SortBy, VerticalSearchResponse } from '@yext/answers-core';
import { AnswersConfig } from './AnswersConfig';
import { InitialStateType } from './initialState';
export declare type Action = {
    type: 'SET_CONFIGURATION';
    config: AnswersConfig;
    initialState: InitialStateType;
} | {
    type: 'PREPARE_FOR_SEARCH';
    searchTerm: string;
} | {
    type: 'ON_SEARCH_TERM_CHANGE';
    searchTerm: string;
} | {
    type: 'SET_VERTICAL_RESPONSE';
    response: VerticalSearchResponse;
} | {
    type: 'SET_AUTOCOMPLETE';
    querySuggestions: AutoCompleteResult[];
    recentSearches: {
        query: string;
    }[];
} | {
    type: 'NEXT_AUTOCOMPLETE_OPTION';
} | {
    type: 'SET_ERROR';
    error: any;
} | {
    type: 'PREVIOUS_AUTOCOMPLETE_OPTION';
} | {
    type: 'APPEND_RESULTS';
    results: any[];
} | {
    type: 'UPDATE_SORT_BYS';
    sortBys?: SortBy[];
} | {
    type: 'UPDATE_FACETS';
    facets: Facet[];
};
declare const reducer: (state: InitialStateType, action: Action) => InitialStateType;
export default reducer;
