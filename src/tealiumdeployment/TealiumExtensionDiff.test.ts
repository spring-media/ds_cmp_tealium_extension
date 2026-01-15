import { Extension } from './Extension';
import { Occurrence, Status, Scope } from './TealiumAPI';
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
        const extension: Extension = Extension.fromLocal(123, 'test-extension', '<code>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extension]);
        diff.setRemoteExtensions([]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(1);
        expect(diff.getExtensionsToUpdate().length).toBe(0);
    });

    it('returns extension for update if it does exist on remote and is different', () => {
        const extensionLocal: Extension = Extension.fromLocal(123, 'test-extension', '<code v2>');
        const extensionRemote: Extension = Extension.fromLocal(123, 'test-extension', '<code v1>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionLocal]);
        diff.setRemoteExtensions([extensionRemote]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(0);
        expect(diff.getExtensionsToUpdate().length).toBe(1);
    });

    it('returns extension for update if it does exist on remote and scope is different', () => {
        const extensionLocal: Extension = Extension.fromLocal(123, 'test-extension', '<code v1>');
        const extensionRemote: Extension = Extension.fromLocal(123, 'test-extension', '<code v1>');
        extensionLocal.setScope(Scope.AfterLoadRules);
        extensionRemote.setScope(Scope.BeforeLoadRules);

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionLocal]);
        diff.setRemoteExtensions([extensionRemote]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(0);
        expect(diff.getExtensionsToUpdate().length).toBe(1);
    });

    it('returns extension for update if it does exist on remote and occurrence is different', () => {
        const extensionLocal: Extension = Extension.fromLocal(123, 'test-extension', '<code v1>');
        const extensionRemote: Extension = Extension.fromLocal(123, 'test-extension', '<code v1>');
        extensionLocal.setOccurrence(Occurrence.RunAlways);
        extensionRemote.setOccurrence(Occurrence.RunOnce);

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionLocal]);
        diff.setRemoteExtensions([extensionRemote]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(0);
        expect(diff.getExtensionsToUpdate().length).toBe(1);
    });

    it('returns extension for update if it does exist on remote and status is different', () => {
        const extensionLocal: Extension = Extension.fromLocal(123, 'test-extension', '<code v1>');
        const extensionRemote: Extension = Extension.fromLocal(123, 'test-extension', '<code v1>');
        extensionLocal.setStatus(Status.Active);
        extensionRemote.setStatus(Status.Inactive);

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionLocal]);
        diff.setRemoteExtensions([extensionRemote]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(0);
        expect(diff.getExtensionsToUpdate().length).toBe(1);
    });

    it('does not add extension for update if code and scope are same', () => {
        const extensionLocal: Extension = Extension.fromLocal(123, 'test-extension', '<code v1>');
        const extensionRemote: Extension = Extension.fromLocal(123, 'test-extension', '<code v1>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionLocal]);
        diff.setRemoteExtensions([extensionRemote]);
        diff.diff();

        expect(diff.getExtensionsNotFound().length).toBe(0);
        expect(diff.getExtensionsToUpdate().length).toBe(0);
    });

    it('throws if local has duplicate extensionIds', () => {
        const extensionA: Extension = Extension.fromLocal(123, 'test-extension A', '<code v1>');
        const extensionB: Extension = Extension.fromLocal(456, 'test-extension B', '<code v1>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionA, extensionA, extensionB, extensionB]);
        diff.setRemoteExtensions([extensionB]);
        expect(() => { diff.diff(); })
            .toThrow('Duplicate extension IDs found: 123, 456');
    });

    it('throws if remote has duplicate extensionIds', () => {
        const extensionA: Extension = Extension.fromLocal(123, 'test-extension A', '<code v1>');
        const extensionB: Extension = Extension.fromLocal(456, 'test-extension B', '<code v1>');

        const diff = new TealiumExtensionDiff();
        diff.setLocalExtensions([extensionA]);
        diff.setRemoteExtensions([extensionA, extensionA, extensionB, extensionB]);
        expect(() => { diff.diff(); })
            .toThrow('Duplicate extension IDs found: 123, 456');
    });
});
