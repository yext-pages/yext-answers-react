import { Facet, Filter, DisplayableFacet } from '../node_modules/@yext/answers-core';
import { AppliedFilter } from './initialState';
export declare const getFacetFilters: (facets: Facet[]) => Filter[];
export declare const getFacetAppliedFilters: (facets: Facet[]) => AppliedFilter[];
export declare const toggleFacetObject: (facets: Facet[], facetFieldId: string, optionDisplayName: string) => DisplayableFacet[];
export declare const displayableToSelectedFacets: (displayableFacets: DisplayableFacet[]) => Facet[];
export declare const displayableToFacets: (displayableFacets: DisplayableFacet[]) => Facet[];
export declare const sortFacets: (facets: Facet[]) => Facet[];
