import { TealiumExtension } from './TealiumAPI';

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

    private notes: string;

    private constructor(
        public readonly name: string,
        public readonly code: string,
        public readonly id?: number
    ) {
        this.notes = '';
    }

    setNotes(notes: string) {
        this.notes = notes;
    }

    getNotes(): string {
        return this.notes;
    }

    // public getFileName() {
    //     return this.notes;
    // }
}
