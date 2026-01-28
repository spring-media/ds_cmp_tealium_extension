import { Occurrence, Status, TealiumExtension, Scope, ExtensionType } from './TealiumAPI';
import crypto from 'node:crypto';

export class Extension {

    static fromRemote(data: TealiumExtension): Extension {
        const code = data.configuration.code;
        const extension = new Extension(data.name, ExtensionType.fromString(data.extensionType), code, data.id);
        extension.setScope(Scope.fromString(data.scope));
        extension.setOccurrence(Occurrence.fromString(data.occurrence));
        extension.setStatus(Status.fromString(data.status));
        extension.setNotes(data.notes);
        return extension;
    }

    /**
     * Creates Javascript Code extension
     */
    static fromLocal(id: number, name: string, code: string, type = ExtensionType.JavascriptCode) {
        return new Extension(name, type, code, id);
    }

    private filepath: string;
    private notes: string;
    private scope: Scope | string;  // Can be enum or numeric tag IDs
    private occurrence: Occurrence;
    private status: Status;

    private constructor(
        public readonly name: string,
        public readonly type: ExtensionType,
        public readonly code: string,
        public readonly id?: number
    ) {
        this.notes = '';
        this.filepath = '';
        this.scope = Scope.AfterLoadRules;
        this.occurrence = Occurrence.RunAlways;
        this.status = Status.Active;
    }

    setScope(scope: Scope | string) {
        this.scope = scope;
    }

    getScope(): Scope | string {
        return this.scope;
    }

    setNotes(notes: string) {
        this.notes = notes;
    }

    getNotes(): string {
        return this.notes;
    }

    getFilepath(): string {
        return this.filepath;
    }

    setFilePath(filepath: string) {
        this.filepath = filepath;
    }

    setOccurrence(occurrence: Occurrence) {
        this.occurrence = occurrence;
    }

    getOccurrence() {
        return this.occurrence;
    }

    setStatus(status: Status) {
        this.status = status;
    }

    getStatus(): Status {
        return this.status;
    }

    getHash() {
        const content = {
            code: this.code,
            scope: this.scope,
            status: this.status,
            occurrence: this.occurrence
        };
        return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
    }
}
