import { JoinDataValuesConverter } from './JoinDataValuesConverter';
import { ExtensionData } from './types';

describe('Join Data Value Converter', () => {
    it('creates a join data values extension', () => {
        const converter = new JoinDataValuesConverter();

        const extension: ExtensionData = {
          name: 'Set CB sections',
          id: 43,
          scope: 'After Load Rules',
          conditions: [],
          configuration: {
            "147090402697400018_set_text": '',
            setoption: '',
            set: '',
            settotext: '',
            settovar: '',
            leadingdelimiter: false,
            var: 'js.cb_sections',
            delimiter: ',',
            defaultvalue: '',
            configs: [
              {set: 'js.page_channel1'},
              {set: "textvalue"},
              {text: "platform: beta"}
            ]

          },
          extensionType: 'Join Data Values',
          occurrence: 'Run Always',
          loadRule: null
        }

        const code = ''
        + `/* Based on JOIN DATA VALUES Set CB sections 43 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b, c, d) {\n`
        + `    try {\n`
        + `        if (1) {\n`
        + `            c = [b['page_channel1'], 'platform: beta'];\n`
        + `            b['cb_sections'] = c.join(',')\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})();\n`

        expect(converter.convert(extension)).toBe(code);
    });

    it('creates a join data values extension, default values, multiple sets', () => {
        const converter = new JoinDataValuesConverter();

        const extension: ExtensionData = {
          name: 'Set IVW cp',
          id: 35,
          scope: '233,155',
          conditions: [],
          configuration: {
            '146788819930700022_set_text': 'a',
            setoption: '',
            set: '',
            settotext: '',
            settovar: '',
            leadingdelimiter: false,
            var: 'js.ivw_cp',
            delimiter: '_',
            defaultvalue: 'a_sonstige',
            configs: [
              { set: 'textvalue'}, 
              { set: 'js.page_channel1'},
              { set: 'js.page_type'}]
          },
          extensionType: 'Join Data Values',
          occurrence: null,
          loadRule: null
        }

        const code = ''
        + `/* Based on JOIN DATA VALUES Set IVW cp 35 */\n`
        + `/* global utag, a, b */\n`
        + `(function(a, b, c, d) {\n`
        + `    try {\n`
        + `        if (1) {\n`
        + `            c = ['a', b['page_channel1'], b['page_type']];\n`
        + `            for (d = 0; d < c.length; d++) {\n`
        + `                if (typeof c[d] == 'undefined' || c[d] == '')\n`
        + `                    c[d] = 'a_sonstige'\n`
        + `            }\n`
        + `            b['ivw_cp'] = c.join('_')\n`
        + `        }\n`
        + `    } catch (e) {\n`
        + `        window.utag.DB(e);\n`
        + `    }\n`
        + `})();\n`;

        expect(converter.convert(extension)).toBe(code);
    });
});

// {



    //   "configuration": {
    //     "146788819930700022_set_text": "a",
    //     "configs": [
    //       {
    //         "set": "textvalue"
    //       },
    //       {
    //         "set": "js.page_channel1"
    //       },
    //       {
    //         "set": "js.page_type"
    //       },
    //       {
    //         "text": ""
    //       }
    //     ],
    //     "146788848943200024_set_text": "",
    //     "leadingdelimiter": false,
    //     "var": "js.ivw_cp",
    //     "delimiter": "_",
    //     "defaultvalue": "a_sonstige"
    //   }
    // }



    // {
    //   "id": 43,
    //   "extensionId": 100002,
    //   "name": "Set CB sections",
    //   "status": "active",
    //   "extensionType": "Join Data Values",
    //   "scope": "After Load Rules",
    //   "occurrence": "Run Always",
    //   "notes": null,
    //   "loadRule": null,
    //   "library": null,
    //   "selectedTargets": {
    //     "dev": true,
    //     "qa": true,
    //     "prod": true
    //   },
    //   "environmentVersions": {
    //     "qa": "202601291554",
    //     "prod": "202601291554",
    //     "dev": "202601291554"
    //   },
    //   "conditions": [],
    //   "configuration": {
    //     "147090402697400018_set_text": "",
    //     "configs": [
    //       {
    //         "set": "js.page_channel1"
    //       },
    //       {
    //         "set": "textvalue"
    //       },
    //       {
    //         "text": "platform: beta"
    //       }
    //     ],
    //     "leadingdelimiter": false,
    //     "var": "js.cb_sections",
    //     "delimiter": ",",
    //     "defaultvalue": ""
    //   }
    // },