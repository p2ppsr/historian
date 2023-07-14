# historian

Token history interpreter for Bitcoin overlay networks

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [Historian](#historian)
    *   [Parameters](#parameters)
    *   [interpret](#interpret)
        *   [Parameters](#parameters-1)
    *   [decodeTokenValue](#decodetokenvalue)
        *   [Parameters](#parameters-2)

### Historian

Interprets the history of a token BRC-8 envelope

#### Parameters

*   `correctOwnerKey`  the ownerKey used in pushdrop to create the locking script
*   `correctSigningKey`  the signing key that should have been used
*   `validate`  validation function to filter history

#### interpret

Recursive function for interpreting the history of a token

##### Parameters

*   `currentEnvelope` &#x20;
*   `currentDepth` &#x20;

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)<[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)>>**&#x20;

#### decodeTokenValue

Decodes a pushdrop token
TODO: Update to support other data structures! --> Currently coded for kvstore tokens

##### Parameters

*   `inputEnvelope` &#x20;

## License & Confidentiality

This is proprietary software developed and owned by Peer-to-peer Privacy Systems Research, LLC.
Except as provided for in your CWI Partner Agreement with us, you may not use this software and
must keep it confidential.
