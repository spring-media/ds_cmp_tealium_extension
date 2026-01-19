import { Occurrence, Status, TealiumExtension, Scope } from './TealiumAPI';
import crypto from 'node:crypto';

export class Extension {

    static fromRemote(data: TealiumExtension): Extension {
        const code = data.configuration.code;
        const extension = new Extension(data.name, code, data.id);
        extension.setNotes(data.notes);
        return extension;
    }

    static fromLocal(id: number, name: string, code: string) {
        return new Extension(name, code, id);
    }

    private filepath: string;
    private notes: string;
    private scope: Scope;
    private occurrence: Occurrence;
    private status: Status;

    private constructor(
        public readonly name: string,
        public readonly code: string,
        public readonly id?: number
    ) {
        this.notes = '';
        this.filepath = '';
        this.scope = Scope.AfterLoadRules;
        this.occurrence = Occurrence.RunAlways;
        this.status = Status.Active;
    }

    setScope(scope: Scope) {
        this.scope = scope;
    }

    getScope(): Scope {
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
