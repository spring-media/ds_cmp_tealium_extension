import { Extension } from './Extension';

export class TealiumExtensionDiff {
    private localExtensions: Extension[];
    private remoteExtensions: Extension[];
    private extensionNotFoundList: Extension[];
    private extensionUpdateList: Extension[];

    constructor() {
        this.localExtensions = [];
        this.remoteExtensions = [];
        this.extensionNotFoundList = [];
        this.extensionUpdateList = [];
    }

    getExtensionsToUpdate(): Extension[] {
        return [...this.extensionUpdateList];
    }
    getExtensionsNotFound(): Extension[] {
        return [...this.extensionNotFoundList];
    }
    setRemoteExtensions(extensions: Extension[]): void {
        this.remoteExtensions = [...extensions];
    }

    setLocalExtensions(extensions: Extension[]): void {
        this.localExtensions = [...extensions];
    }

    diff() {
        // Duplication validation
        console.log('Validate no duplicate extension IDs in local extensions');
        this.validateNoDuplicateExtensionIds(this.localExtensions);
        console.log('Validate no duplicate extension IDs in remote extensions');
        this.validateNoDuplicateExtensionIds(this.remoteExtensions);

        // find remote extension
        this.localExtensions.forEach((l) => {
            const remoteExtension = this.remoteExtensions.find(r => r.id === l.id && r.type === l.type);
            if (remoteExtension) {

                if (l.code !== remoteExtension.code) {
                    // if code different -> update
                    this.extensionUpdateList.push(l);
                } else if (l.getScope() !== remoteExtension.getScope()) {
                    // if scope different -> update
                    this.extensionUpdateList.push(l);
                } else if (l.getOccurrence() !== remoteExtension.getOccurrence()) {
                    // if occurance different -> update
                    this.extensionUpdateList.push(l);
                } else if (l.getStatus() !== remoteExtension.getStatus()) {
                    // if status different -> update
                    this.extensionUpdateList.push(l);
                }
            } else {
                // extension not found in remote -> ignore
                this.extensionNotFoundList.push(l);
            }
        });
    }

    private validateNoDuplicateExtensionIds(extensions: Extension[]): void {
        const ids = extensions.map(e => e.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
            throw new Error(`Duplicate extension IDs found: ${duplicates.join(', ')}`);
        }
    }
}
