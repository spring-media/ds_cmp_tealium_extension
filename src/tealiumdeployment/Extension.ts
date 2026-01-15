import { TealiumExtension } from './TealiumAPI';

export class Extension {
    static fromRemote(data: TealiumExtension): Extension {
        const code = data.configuration.code;
        return new Extension(data.name, code, data.extensionId);
    }

    static fromLocal(extensionId: string, name: string, code: string) {
        return new Extension(name, code, extensionId);
    }

    private constructor(
        public readonly name: string,
        public readonly code: string,
        public readonly extensionId?: string
    ) {

    }

    // public getFileName() {
    //     return this.notes;
    // }
}
