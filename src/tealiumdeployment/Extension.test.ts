import { Extension } from './Extension';
import { TealiumExtension } from './TealiumAPI';

describe('Extension', () => {
    it('is created from remote', () => {
        const tealiumResponse: TealiumExtension = {
            id: '7',
            name: 'test-extension',
            extensionId: '123',
            extenstionType: 'Javascript Code',
            notes: '',
            scope: 'After Load Rules',
            configuration: {
                code: 'console.log("Hello World");'
            }
        };
        const extension = Extension.fromRemote(tealiumResponse);
        expect(extension.name).toBe('test-extension');
        expect(extension.extensionId).toBe('123');
        expect(extension.code).toBe('console.log("Hello World");');
    });
});
