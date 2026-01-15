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

    private filepath: string;
    private notes: string;

    private constructor(
        public readonly name: string,
        public readonly code: string,
        public readonly id?: number
    ) {
        this.notes = '';
        this.filepath = '';
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
}
