import { DisplayableFacet, DisplayableFacetOption, Facet } from '@yext/answers-core';

export function createFacets(facets: any): DisplayableFacet[] {
  if (!facets) {
    return [];
  }

  return facets.map((facet: Facet) => {
    const fieldId = facet.fieldId ? facet.fieldId : 'emptyFieldId'
    const displayName = facet.fieldId ? facet.fieldId : 'emptyDisplayName'
    const options = facet.options ? createFacetOptions(facet.options) : [];

    return ({
      fieldId: fieldId,
      displayName: displayName,
      options: options
  })
});
}

function createFacetOptions(options: any[]): DisplayableFacetOption[] {
  return options.map((option: any) => {
    return {
      displayName: option.displayName,
      count: option.count,
      selected: option.selected,
      matcher: option.matcher,
      value: option.value as string | number | boolean
    };
  });
}
