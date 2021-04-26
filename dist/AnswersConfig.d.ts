import { Facet } from '../node_modules/@yext/answers-core';
export declare type AnswersConfig = {
    apiKey: string;
    experienceKey: string;
    experienceVersion: string;
    locale: string;
    verticalKey: string;
    runSearchOnLoad?: boolean;
    facetSorter?: (facets: Facet[]) => Facet[];
    debug?: boolean;
};
