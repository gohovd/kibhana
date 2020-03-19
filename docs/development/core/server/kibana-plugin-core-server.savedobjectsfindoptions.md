<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-core-server](./kibana-plugin-core-server.md) &gt; [SavedObjectsFindOptions](./kibana-plugin-core-server.savedobjectsfindoptions.md)

## SavedObjectsFindOptions interface


<b>Signature:</b>

```typescript
export interface SavedObjectsFindOptions extends SavedObjectsBaseOptions 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [defaultSearchOperator](./kibana-plugin-core-server.savedobjectsfindoptions.defaultsearchoperator.md) | <code>'AND' &#124; 'OR'</code> |  |
|  [fields](./kibana-plugin-core-server.savedobjectsfindoptions.fields.md) | <code>string[]</code> | An array of fields to include in the results |
|  [filter](./kibana-plugin-core-server.savedobjectsfindoptions.filter.md) | <code>string</code> |  |
|  [hasReference](./kibana-plugin-core-server.savedobjectsfindoptions.hasreference.md) | <code>{</code><br/><code>        type: string;</code><br/><code>        id: string;</code><br/><code>    }</code> |  |
|  [page](./kibana-plugin-core-server.savedobjectsfindoptions.page.md) | <code>number</code> |  |
|  [perPage](./kibana-plugin-core-server.savedobjectsfindoptions.perpage.md) | <code>number</code> |  |
|  [search](./kibana-plugin-core-server.savedobjectsfindoptions.search.md) | <code>string</code> | Search documents using the Elasticsearch Simple Query String syntax. See Elasticsearch Simple Query String <code>query</code> argument for more information |
|  [searchFields](./kibana-plugin-core-server.savedobjectsfindoptions.searchfields.md) | <code>string[]</code> | The fields to perform the parsed query against. See Elasticsearch Simple Query String <code>fields</code> argument for more information |
|  [sortField](./kibana-plugin-core-server.savedobjectsfindoptions.sortfield.md) | <code>string</code> |  |
|  [sortOrder](./kibana-plugin-core-server.savedobjectsfindoptions.sortorder.md) | <code>string</code> |  |
|  [type](./kibana-plugin-core-server.savedobjectsfindoptions.type.md) | <code>string &#124; string[]</code> |  |
