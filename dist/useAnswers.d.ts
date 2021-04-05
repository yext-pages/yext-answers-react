import { SortBy } from '@yext/answers-core';
import { AnswersConfig } from './AnswersConfig';
import { InitialStateType } from './initialState';
export declare const useAnswers: () => {
    state: InitialStateType;
    actions: {
        runSearch: (searchTerm?: string, clearFacets?: boolean) => Promise<void>;
        handleSearchTermChange: (searchTerm?: string) => Promise<void>;
        chooseAutocompleteOption: (index: number) => void;
        toggleFacet: (facetFieldId: string, optionDisplayName: string, updateSearchResults?: boolean) => Promise<void>;
        loadMore: () => Promise<void>;
        updateSortBys: (sortBys: SortBy[] | undefined, updateSearchResults?: boolean) => Promise<void>;
        setConfiguration: (config: AnswersConfig, initialState: InitialStateType) => void;
        nextAutocompleteOption: () => void;
        prevAutocompleteOption: () => void;
        clearSearch: () => void;
        simpleFilter: (fieldId: string, value?: string) => Promise<void>;
    };
};
