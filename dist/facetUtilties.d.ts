import { Facet, SimpleFilter } from '@yext/answers-core';
import { AppliedFilter } from './initialState';
export declare const getFacetFilters: (facets: Facet[]) => SimpleFilter[];
export declare const getFacetAppliedFilters: (facets: Facet[]) => AppliedFilter[];
export declare const toggleFacetObject: (facets: Facet[], facetFieldId: string, optionDisplayName: string) => Facet[];
export declare const sortFacets: (facets: Facet[]) => {
    options: import("@yext/answers-core").FacetOption[];
    fieldId: string;
    displayName: string;
}[];
