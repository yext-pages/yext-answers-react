import {
  Facet,
  SortBy,
  VerticalSearchResponse,
  Matcher,
} from '@yext/answers-core';
import { useContext } from 'react';
import RecentSearches from 'recent-searches';
import { AnswersConfig } from './AnswersConfig';
import { AppContext } from './AnswersStore';
import { getSelectedFacets, toggleFacetObject, displayableToFacets } from './facetUtilties';
import { InitialStateType } from './initialState';
import { createFacets } from './createFacets';

const recentSearchesController = new RecentSearches();

export const useAnswers = () => {
  const { state, dispatch } = useContext(AppContext);
  const {
    lastSearchedTerm,
    visibleSearchTerm,
    facets,
    autocomplete,
    sortBys,
    verticalKey,
    results,
    core,
  } = state;

  const setConfiguration = (
    config: AnswersConfig,
    initialState: InitialStateType
  ) => {
    dispatch({
      type: 'SET_CONFIGURATION',
      config,
      initialState,
    });
  };

  const runSearch = async (
    searchTerm: string = visibleSearchTerm,
    clearFacets = true
  ) => {
    recentSearchesController.setRecentSearch(searchTerm);

    handleSearch(searchTerm, clearFacets ? undefined : facets, sortBys);
  };

  const chooseAutocompleteOption = (index: number) => {
    const option = autocomplete.autocompleteOptions[index];
    if (option) {
      runSearch(option.value);
    } else {
      console.log('Index does not exist');
    }
  };

  const handleSearch = async (
    searchTerm: string,
    facets?: Facet[],
    sortBys?: SortBy[]
  ) => {
    dispatch({
      type: 'PREPARE_FOR_SEARCH',
      searchTerm: searchTerm,
    });

    try {
      const res: VerticalSearchResponse = await core.verticalSearch({
        query: searchTerm,
        context: {},
        verticalKey,
        retrieveFacets: true,
        sortBys,
        facets,
      });
      dispatch({
        type: 'SET_VERTICAL_RESPONSE',
        response: res,
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        error,
      });
    }
  };

  const handleSearchTermChange = async (
    searchTerm: string = visibleSearchTerm
  ) => {
    dispatch({
      type: 'ON_SEARCH_TERM_CHANGE',
      searchTerm,
    });
    const res = await core.verticalAutocomplete({
      input: searchTerm,
      verticalKey,
    });
    dispatch({
      type: 'SET_AUTOCOMPLETE',
      querySuggestions: res.results,
      recentSearches: recentSearchesController.getRecentSearches(searchTerm),
    });
  };

  const updateSortBys = async (
    sortBys: SortBy[] | undefined,
    updateSearchResults = true
  ) => {
    dispatch({
      type: 'UPDATE_SORT_BYS',
      sortBys,
    });

    if (updateSearchResults) {
      handleSearch(lastSearchedTerm, facets, sortBys);
    }
  };

  const toggleFacet = async (
    facetFieldId: string,
    optionDisplayName: string,
    updateSearchResults = true
  ) => {
    const updatedFacets = toggleFacetObject(
      state.facets,
      facetFieldId,
      optionDisplayName
    );
    dispatch({
      type: 'UPDATE_FACETS',
      facets: updatedFacets,
    });

    dispatch({
      type: 'UPDATE_DISPLAYABLE_FACETS',
      displayableFacets: updatedFacets
    })
    // let removed = false;
    
    // const updatedFacetFilters2 = updatedFacets.filter((facet) => {
    //   facet.options.forEach((option) => {
    //     if(facet.fieldId == facetFieldId && option.value === optionDisplayName && option.selected){
    //       // removed = true;
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   })
    // })
    console.log("BEFORE:  ", facets);
    const facets2 = displayableToFacets(updatedFacets)
    const updatedFacetFilters = facets2.filter(facet => {
      facet.options.forEach((o) => {
        console.log(facet.fieldId, facetFieldId, "-", o.value, optionDisplayName);
        if (facet.fieldId === facetFieldId && o.value === optionDisplayName) {
          console.log("removed = true", facet.fieldId, facetFieldId, "-", o.value, optionDisplayName);
          // removed = true;
          return false;
        } else {
          console.log("return true");
          return true;
        }
      })
    });

    // if (!removed) {
    //   updatedFacetFilters2.push({
    //     fieldId: facetFieldId,
    //     options: [
    //       {
    //         matcher: Matcher.Equals, 
    //         value: optionDisplayName,
    //         displayName: optionDisplayName,
    //         count: option
    //       }
    //     ]
    //   });
    // }
    // console.log("AFTER:  ", updatedFacetFilters2);
    console.log("AFTER:  ", updatedFacetFilters);

    if (updateSearchResults) {
      handleSearch(lastSearchedTerm, updatedFacetFilters, sortBys);
    }
  };

  const loadMore = async () => {
    const res = await core.verticalSearch({
      query: lastSearchedTerm,
      context: {},
      verticalKey,
      retrieveFacets: true,
      facets: getSelectedFacets(facets),  // this needs to be only the selected facets
      offset: results.length,
    });

    dispatch({
      type: 'APPEND_RESULTS',
      results: res.verticalResults.results,
    });
  };

  const nextAutocompleteOption = () => {
    dispatch({ type: 'NEXT_AUTOCOMPLETE_OPTION' });
  };

  const prevAutocompleteOption = () => {
    dispatch({ type: 'PREVIOUS_AUTOCOMPLETE_OPTION' });
  };

  const clearSearch = () => {
    const displayFacets = createFacets(facets)
    dispatch({ type: 'ON_SEARCH_TERM_CHANGE', searchTerm: '' });
    dispatch({
      type: 'UPDATE_FACETS',
      facets: displayFacets.map(f => {
        return {
          ...f,
          options: f.options.map(o => {
            return {
              ...o,
              selected: false,
            };
          }),
        };
      }),
    });
    dispatch({ type: 'UPDATE_SORT_BYS', sortBys: undefined });
    handleSearch('', undefined, undefined);
  };

  const simpleFilter = async (
    fieldId: string,
    value = 'test'
  ) => {
      let facets: Facet[] = [];
      facets.push({
        fieldId: fieldId,
        options: [
          {matcher: Matcher.Equals, value: value}
        ]
      });
        dispatch({
          type: 'SIMPLE_FILTER_UPDATE',
          simpleFilters: facets,
        });

      handleSearch(lastSearchedTerm, facets, undefined);
  };

  return {
    state,
    actions: {
      runSearch,
      handleSearchTermChange,
      chooseAutocompleteOption,
      toggleFacet,
      loadMore,
      updateSortBys,
      setConfiguration,
      nextAutocompleteOption,
      prevAutocompleteOption,
      clearSearch,
      simpleFilter,
    },
  };
};
