<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-plugins-data-public](./kibana-plugin-plugins-data-public.md) &gt; [search](./kibana-plugin-plugins-data-public.search.md)

## search variable

<b>Signature:</b>

```typescript
search: {
    aggs: {
        AggConfigs: typeof AggConfigs;
        aggGroupNamesMap: () => Record<"buckets" | "metrics", string>;
        aggTypeFilters: import("./search/aggs/filter/agg_type_filters").AggTypeFilters;
        CidrMask: typeof CidrMask;
        convertDateRangeToString: typeof convertDateRangeToString;
        convertIPRangeToString: (range: import("./search").IpRangeKey, format: (val: any) => string) => string;
        dateHistogramInterval: typeof dateHistogramInterval;
        intervalOptions: ({
            display: string;
            val: string;
            enabled(agg: import("./search/aggs/buckets/_bucket_agg_type").IBucketAggConfig): boolean | "" | undefined;
        } | {
            display: string;
            val: string;
        })[];
        InvalidEsCalendarIntervalError: typeof InvalidEsCalendarIntervalError;
        InvalidEsIntervalFormatError: typeof InvalidEsIntervalFormatError;
        isDateHistogramBucketAggConfig: typeof isDateHistogramBucketAggConfig;
        isStringType: (agg: import("./search").AggConfig) => boolean;
        isType: (type: string) => (agg: import("./search").AggConfig) => boolean;
        isValidEsInterval: typeof isValidEsInterval;
        isValidInterval: typeof isValidInterval;
        parentPipelineType: string;
        parseEsInterval: typeof parseEsInterval;
        parseInterval: typeof parseInterval;
        propFilter: typeof propFilter;
        siblingPipelineType: string;
        termsAggFilter: string[];
        toAbsoluteDates: typeof toAbsoluteDates;
    };
    getRequestInspectorStats: typeof getRequestInspectorStats;
    getResponseInspectorStats: typeof getResponseInspectorStats;
    tabifyAggResponse: typeof tabifyAggResponse;
    tabifyGetColumns: typeof tabifyGetColumns;
}
```