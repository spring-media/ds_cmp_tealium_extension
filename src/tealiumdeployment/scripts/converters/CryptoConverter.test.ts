import { CryptoConverter } from './CryptoConverter';
import { ExtensionData, CryptoConfiguration } from './types';

describe('CryptoConverter', () => {
    it('converts crypto extension with SHA-256 hash (hash type 3)', () => {
        const exampleExtension: ExtensionData = {
            name: 'Hash SSO ID',
            id: 724,
            scope: 'After Load Rules',
            extensionType: 'Crypto Extension',
            occurrence: 'Run Always',
            loadRule: null,
            conditions: [
                [
                    {
                        variable: 'udo.double_customer_id',
                        operator: null,
                        value: null
                    }
                ],
                [
                    {
                        variable: 'udo.customer_id',
                        operator: null,
                        value: null
                    }
                ],
                [
                    {
                        variable: 'udo.customer_pcp_sso_id',
                        operator: null,
                        value: null
                    }
                ]
            ],
            configuration: {
                constructor: '',
                initialize: '',
                hash: '3'
            }
        };

        const converter = new CryptoConverter();
        const resultingCode =
            '/* eslint-disable */\n' +
            '/* Based on CRYPTO EXTENSION Hash SSO ID 724 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            "        if ((typeof b['double_customer_id'] != 'undefined' || typeof b['customer_id'] != 'undefined' || typeof b['customer_pcp_sso_id'] != 'undefined')) {\n" +
            "            if (typeof b['double_customer_id'] != 'undefined' && b['double_customer_id'] !== '') {\n" +
            "                b['double_customer_id'] = utag.ut.sha256(b['double_customer_id']);\n" +
            '            }\n' +
            "            if (typeof b['customer_id'] != 'undefined' && b['customer_id'] !== '') {\n" +
            "                b['customer_id'] = utag.ut.sha256(b['customer_id']);\n" +
            '            }\n' +
            "            if (typeof b['customer_pcp_sso_id'] != 'undefined' && b['customer_pcp_sso_id'] !== '') {\n" +
            "                b['customer_pcp_sso_id'] = utag.ut.sha256(b['customer_pcp_sso_id']);\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})(a, b);\n';

        expect(converter.convert(exampleExtension)).toBe(resultingCode);
    });

    it('converts crypto extension with MD5 hash (hash type 1)', () => {
        const exampleExtension: ExtensionData = {
            name: 'Hash Email',
            id: 123,
            scope: 'After Load Rules',
            extensionType: 'Crypto Extension',
            occurrence: 'Run Always',
            loadRule: null,
            conditions: [
                [
                    {
                        variable: 'udo.user_email',
                        operator: null,
                        value: null
                    }
                ]
            ],
            configuration: {
                hash: '1'
            } as CryptoConfiguration
        };

        const converter = new CryptoConverter();
        const resultingCode =
            '/* eslint-disable */\n' +
            '/* Based on CRYPTO EXTENSION Hash Email 123 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            "        if (typeof b['user_email'] != 'undefined') {\n" +
            "            if (typeof b['user_email'] != 'undefined' && b['user_email'] !== '') {\n" +
            "                b['user_email'] = utag.ut.md5(b['user_email']);\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})(a, b);\n';

        expect(converter.convert(exampleExtension)).toBe(resultingCode);
    });

    it('converts crypto extension with SHA-1 hash (hash type 2)', () => {
        const exampleExtension: ExtensionData = {
            name: 'Hash User ID',
            id: 456,
            scope: 'After Load Rules',
            extensionType: 'Crypto Extension',
            occurrence: 'Run Always',
            loadRule: null,
            conditions: [
                [
                    {
                        variable: 'udo.user_id',
                        operator: null,
                        value: null
                    }
                ]
            ],
            configuration: {
                hash: '2'
            } as CryptoConfiguration
        };

        const converter = new CryptoConverter();
        const resultingCode =
            '/* eslint-disable */\n' +
            '/* Based on CRYPTO EXTENSION Hash User ID 456 */\n' +
            '/* global utag, a, b */\n' +
            '(function(a, b) {\n' +
            '    try {\n' +
            "        if (typeof b['user_id'] != 'undefined') {\n" +
            "            if (typeof b['user_id'] != 'undefined' && b['user_id'] !== '') {\n" +
            "                b['user_id'] = utag.ut.sha1(b['user_id']);\n" +
            '            }\n' +
            '        }\n' +
            '    } catch (e) {\n' +
            '        window.utag.DB(e);\n' +
            '    }\n' +
            '})(a, b);\n';

        expect(converter.convert(exampleExtension)).toBe(resultingCode);
    });

    it('returns false for unsupported hash type', () => {
        const exampleExtension: ExtensionData = {
            name: 'Invalid Hash',
            id: 999,
            scope: 'After Load Rules',
            extensionType: 'Crypto Extension',
            occurrence: 'Run Always',
            loadRule: null,
            conditions: [
                [
                    {
                        variable: 'udo.test_var',
                        operator: null,
                        value: null
                    }
                ]
            ],
            configuration: {
                hash: '99'
            } as CryptoConfiguration
        };

        const converter = new CryptoConverter();
        expect(converter.convert(exampleExtension)).toBe(false);
    });

    it('returns false when no variables to hash', () => {
        const exampleExtension: ExtensionData = {
            name: 'No Variables',
            id: 888,
            scope: 'After Load Rules',
            extensionType: 'Crypto Extension',
            occurrence: 'Run Always',
            loadRule: null,
            conditions: [],
            configuration: {
                hash: '3'
            } as CryptoConfiguration
        };

        const converter = new CryptoConverter();
        expect(converter.convert(exampleExtension)).toBe(false);
    });

    it('handles conditions with "defined" operator', () => {
        const exampleExtension: ExtensionData = {
            name: 'Hash with Defined Operator',
            id: 777,
            scope: 'After Load Rules',
            extensionType: 'Crypto Extension',
            occurrence: 'Run Always',
            loadRule: null,
            conditions: [
                [
                    {
                        variable: 'udo.test_var',
                        operator: 'defined',
                        value: ''
                    }
                ]
            ],
            configuration: {
                hash: '3'
            } as CryptoConfiguration
        };

        const converter = new CryptoConverter();
        const result = converter.convert(exampleExtension);
        
        expect(result).toContain("b['test_var'] = utag.ut.sha256(b['test_var'])");
    });

    it('removes variable prefixes (udo., js., cp.)', () => {
        const exampleExtension: ExtensionData = {
            name: 'Hash Multiple Prefixes',
            id: 666,
            scope: 'After Load Rules',
            extensionType: 'Crypto Extension',
            occurrence: 'Run Always',
            loadRule: null,
            conditions: [
                [
                    {
                        variable: 'udo.udo_var',
                        operator: null,
                        value: null
                    }
                ],
                [
                    {
                        variable: 'js.js_var',
                        operator: null,
                        value: null
                    }
                ],
                [
                    {
                        variable: 'cp.cp_var',
                        operator: null,
                        value: null
                    }
                ]
            ],
            configuration: {
                hash: '3'
            } as CryptoConfiguration
        };

        const converter = new CryptoConverter();
        const result = converter.convert(exampleExtension);
        
        expect(result).toContain("b['udo_var']");
        expect(result).toContain("b['js_var']");
        expect(result).toContain("b['cp_var']");
    });

    it('does not duplicate variables that appear multiple times', () => {
        const exampleExtension: ExtensionData = {
            name: 'Duplicate Variables',
            id: 555,
            scope: 'After Load Rules',
            extensionType: 'Crypto Extension',
            occurrence: 'Run Always',
            loadRule: null,
            conditions: [
                [
                    {
                        variable: 'udo.user_id',
                        operator: null,
                        value: null
                    }
                ],
                [
                    {
                        variable: 'udo.user_id',
                        operator: 'defined',
                        value: ''
                    }
                ]
            ],
            configuration: {
                hash: '3'
            } as CryptoConfiguration
        };

        const converter = new CryptoConverter();
        const result = converter.convert(exampleExtension);
        
        // Count occurrences of the hash operation
        expect(result).not.toBe(false);
        if (result) {
            const matches = result.match(/b\['user_id'\] = utag\.ut\.sha256/g);
            expect(matches?.length).toBe(1);
        }
    });
});
