import { Extension } from './Extension';
import { Occurrence, Scope, Status, TealiumExtension } from './TealiumAPI';

describe('Extension', () => {
    it('can be created from remote', () => {
        const tealiumResponse: TealiumExtension = {
            id: 7,
            name: 'test-extension',
            extensionId: '123',
            extensionType: 'Javascript Code',
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

    describe('getHash', () => {
        it('can create a hash', () => {
            const extension = Extension.fromLocal(123, 'test-extension', 'console.log("test");');
            expect(extension.getHash()).toEqual('ef945f16c968dad131a99279f79c283e31816066bb48436de0265a4b3579a3b6');
        });

        it('changes if code is changed', () => {
            const extensionA = Extension.fromLocal(123, 'test-extension', 'console.log("test");');
            expect(extensionA.getHash()).toEqual('ef945f16c968dad131a99279f79c283e31816066bb48436de0265a4b3579a3b6');

            const extensionB = Extension.fromLocal(123, 'test-extension', 'console.log("hello");');
            expect(extensionB.getHash()).toEqual('bcc3426863eb61436eb611ee0e328140a5e66728ddb20da68b3386be84505fee');
        });

        it('changes if scope is changed', () => {
            const extension = Extension.fromLocal(123, 'test-extension', 'console.log("test");');
            extension.setScope(Scope.AfterLoadRules);
            expect(extension.getHash()).toEqual('ef945f16c968dad131a99279f79c283e31816066bb48436de0265a4b3579a3b6');

            extension.setScope(Scope.BeforeLoadRules);
            expect(extension.getHash()).toEqual('4e72dfe77437fb4fffbd287346c02fdcac1f24a8be398cfbd3af6bf17961a598');
        });

        it('changes if status is changed', () => {
            const extension = Extension.fromLocal(123, 'test-extension', 'console.log("test");');
            extension.setStatus(Status.Active);
            expect(extension.getHash()).toEqual('ef945f16c968dad131a99279f79c283e31816066bb48436de0265a4b3579a3b6');

            extension.setStatus(Status.Inactive);
            expect(extension.getHash()).toEqual('179acdade713e698c8eae9606574108f3d7a6552e002a6904fe2880a37cffbae');
        });

        it('changes if occurrence is changed', () => {
            const extension = Extension.fromLocal(123, 'test-extension', 'console.log("test");');
            extension.setOccurrence(Occurrence.RunAlways);
            expect(extension.getHash()).toEqual('ef945f16c968dad131a99279f79c283e31816066bb48436de0265a4b3579a3b6');

            extension.setOccurrence(Occurrence.RunOnce);
            expect(extension.getHash()).toEqual('2d6aa9f8d52fa90d61833171b1d5a0adfb6300b2d9c5767eafaf451d5665eb16');
        });
    });
});
