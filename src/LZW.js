/**
 * Lempel-Ziv-Welch (LZW) algorithm Compression/Decompression for Strings
 * http://rosettacode.org/wiki/LZW_compression#JavaScript
 *
 * let str = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.
 * Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
 * when an unknown printer took a galley of type and scrambled it to make a type specimen book.
 * It has survived not only five centuries, but also the leap into electronic typesetting,
 * remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
 * sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like
 * Aldus PageMaker including versions of Lorem Ipsum.";
 *
 * console.log(str.length) // 574
 *
 * let compressed = LZW.compress(str) // 358
 *
 * let uncompressed = LZW.decompress(str) // 574
 */

export default {
    compress (uncompressed) {
        "use strict";
        // Build the dictionary.
        let i,
            dictionary = {},
            c,
            wc,
            w = "",
            result = [],
            dictSize = 256;
        for (i = 0; i < 256; i += 1) {
            dictionary[String.fromCharCode(i)] = i;
        }

        for (i = 0; i < uncompressed.length; i += 1) {
            c = uncompressed.charAt(i);
            wc = w + c;
            // Do not use dictionary[wc] because javascript arrays
            // will return values for array['pop'], array['push'] etc
            // if (dictionary[wc]) {
            if (dictionary.hasOwnProperty(wc)) {
                w = wc;
            } else {
                result.push(dictionary[w]);
                // Add wc to the dictionary.
                dictionary[wc] = dictSize++;
                w = String(c);
            }
        }

        // Output the code for w.
        if (w !== "") {
            result.push(dictionary[w]);
        }
        return result;
    },


    decompress (compressed) {
        "use strict";
        // Build the dictionary.
        let i,
            dictionary = [],
            w,
            result,
            k,
            entry = "",
            dictSize = 256;
        for (i = 0; i < 256; i += 1) {
            dictionary[i] = String.fromCharCode(i);
        }

        w = String.fromCharCode(compressed[0]);
        result = w;
        for (i = 1; i < compressed.length; i += 1) {
            k = compressed[i];
            if (dictionary[k]) {
                entry = dictionary[k];
            } else {
                if (k === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return null;
                }
            }

            result += entry;

            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);

            w = entry;
        }
        return result;
    }
};