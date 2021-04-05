import { Facet, Filter, DisplayableFacet } from '@yext/answers-core';
import { AppliedFilter } from './initialState';
import { createFacets } from './createFacets';

export const getFacetFilters = (facets: Facet[]): Filter[] => {
  //this needs to return all selected FILTERS - which no longer exist on facet objects
  // theoretically it could just be all of the facets
  const displayableFacets = createFacets(facets);

  // turn facets into DisplayableFacets
  return displayableFacets
    .map(f => {
      return [
        ...f.options
          .filter(o => o.selected)
          .map(o => {
            // building a new filter object
            const filter: Filter = {
              fieldId: f.fieldId,
              matcher: o.matcher,
              value: o.value,
            };
            return filter;
          }),
      ];
    })
    .flat();
};

export const getSelectedFacets = (facets: Facet[]): Facet[] => {
  console.log(facets);
  console.log("getSelectedFacets");
  return [];
}
export const getFacetAppliedFilters = (facets: Facet[]): AppliedFilter[] => {
  return facets
    .map(f => {
      return [
        ...f.options
          .filter(o => o.value)
          .map(o => {
            const filter: AppliedFilter = {
              displayName: f.fieldId,
              fieldId: f.fieldId,
              source: 'FACET',
              values: [o.value.toString()],
            };
            return filter;
          }),
      ];
    })
    .flat();
};

export const toggleFacetObject = (
  facets: Facet[],
  facetFieldId: string,
  optionDisplayName: string
): DisplayableFacet[] => {
  const updatedFacets = [...facets];
  const displayableFacets = createFacets(updatedFacets);

  displayableFacets.forEach(f => {
    if (f.fieldId === facetFieldId) {
      f.options.forEach(o => {
        if (o.displayName === optionDisplayName) {
          console.log("FLIPPING", o.displayName)
          o.selected = !o.selected;
        }
      });
    } else return;
  });
  return displayableFacets;
};

export const displayableToFacets = (displayableFacets: DisplayableFacet[]) : Facet[] => {
  let facets :Facet[] = [];
  displayableFacets.forEach((displayFacet) => {
    facets.push({
      fieldId: displayFacet.fieldId,
      options: displayFacet.options
    })
  })
  return facets;
}

export const sortFacets = (facets: Facet[]) => {
  //TODO(tredshaw): how are we going to sort Facets/do we even need to anymore
  // this shoudl take Facets and return displayableFacets?
  return facets
  // return facets.map(facet => {
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
