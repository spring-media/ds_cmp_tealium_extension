import { Extension } from './Extension';
import { TealiumExtensionDiff } from './TealiumExtensionDiff';

describe('TealiumExtensionDiff', () => {

    it('has no extensions to update or extension not found if no local extensions given', () => {
        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([]);
        diff.setRemoteExtensions([]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(0);
        expect(diff.getExtensionsToUpdate().length).toBe(0);
    });

    it('returns extension as not found if it does not exist on remote', () => {
        const extension: Extension = Extension.fromLocal('extID123', 'test-extension', '<code>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extension]);
        diff.setRemoteExtensions([]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(1);
        expect(diff.getExtensionsToUpdate().length).toBe(0);
    });

    it('returns extension for update if it does exist on remote', () => {
        const extensionLocal: Extension = Extension.fromLocal('extID123', 'test-extension', '<code v2>');
        const extensionRemote: Extension = Extension.fromLocal('extID123', 'test-extension', '<code v1>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionLocal]);
        diff.setRemoteExtensions([extensionRemote]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(0);
        expect(diff.getExtensionsToUpdate().length).toBe(1);
    });

    it('does not add extension for update if code matches', () => {
        const extensionLocal: Extension = Extension.fromLocal('extID123', 'test-extension', '<code v1>');
        const extensionRemote: Extension = Extension.fromLocal('extID123', 'test-extension', '<code v1>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionLocal]);
        diff.setRemoteExtensions([extensionRemote]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(0);
        expect(diff.getExtensionsToUpdate().length).toBe(0);
    });

    it('throws if local has duplicate extensionIds', () => {
        const extensionA: Extension = Extension.fromLocal('extID123', 'test-extension A', '<code v1>');
        const extensionB: Extension = Extension.fromLocal('extID456', 'test-extension B', '<code v1>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionA, extensionA, extensionB, extensionB]);
        diff.setRemoteExtensions([extensionB]);
        expect(() => { diff.diff(); })
            .toThrow('Duplicate extension IDs found: extID123, extID456');


    });

    it('throws if remote has duplicate extensionIds', () => {
        const extensionA: Extension = Extension.fromLocal('extID123', 'test-extension A', '<code v1>');
        const extensionB: Extension = Extension.fromLocal('extID456', 'test-extension B', '<code v1>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionA]);
        diff.setRemoteExtensions([extensionA, extensionA, extensionB, extensionB]);
        expect(() => { diff.diff(); })
            .toThrow('Duplicate extension IDs found: extID123, extID456');
    });
});
