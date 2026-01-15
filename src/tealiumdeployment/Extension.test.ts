import { Extension } from './Extension';
import { TealiumExtension } from './TealiumAPI';

describe('Extension', () => {
    it('can be created from remote', () => {
        const tealiumResponse: TealiumExtension = {
            id: 7,
            name: 'test-extension',
            extensionId: '123',
            extenstionType: 'Javascript Code',
            notes: 'A test note',
            scope: 'After Load Rules',
            configuration: {
                code: 'console.log("Hello World");'
            }
        };
        const extension = Extension.fromRemote(tealiumResponse);
        expect(extension.name).toBe('test-extension');
        expect(extension.id).toBe(7);
        expect(extension.code).toBe('console.log("Hello World");');
        expect(extension.getNotes()).toBe('A test note');
        expect(extension.getFilepath()).toBe('');
    });

    it('can be created from local', () => {
        const extension = Extension.fromLocal(123, 'test-extension', 'console.log("test");');

        expect(extension.name).toBe('test-extension');
        expect(extension.id).toBe(123);
        expect(extension.code).toBe('console.log("test");');
        expect(extension.getNotes()).toBe('');
    });

    it('can have a filepath set', () => {
        const extension = Extension.fromLocal(123, 'test-extension', 'console.log("test");');
        expect(extension.getFilepath()).toBe('');
        extension.setFilePath('./extension/test.js');
        expect(extension.getFilepath()).toBe('./extension/test.js');
    });

    it('can have notes set', () => {
        const extension = Extension.fromLocal(123, 'test-extension', 'console.log("test");');

        expect(extension.getNotes()).toBe('');
        extension.setNotes('An example note');
        expect(extension.getNotes()).toBe('An example note');
    });
});
