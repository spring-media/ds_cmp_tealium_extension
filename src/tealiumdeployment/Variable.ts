import crypto from 'node:crypto';

export class Variable {

    public static fromRemote(obj: unknown): Variable | undefined {

        if(typeof obj === 'object' && obj !== null &&
            'id' in obj && typeof obj.id === 'number' &&
            'name' in obj && typeof obj.name === 'string' &&
            'type' in obj && typeof obj.type === 'string' &&
                (obj.type === 'udo' || obj.type === 'cp' || obj.type === 'qp' || obj.type === 'meta' ) &&
            'alias' in obj && ( typeof obj.alias === 'string' || obj.alias === null ) &&
            'notes' in obj && ( typeof obj.notes === 'string' || obj.notes === null )
        ) {
            return new Variable(obj.id, obj.name, obj.type)
                .setAlias(obj.alias)
                .setNotes(obj.notes);
        }
    }

    public readonly uniqueIdentifier: string;
    private notes: string | null;
    private alias: string | null;

    constructor(
        public readonly id: number, 
        public readonly name: string,
        public readonly type: 'udo' | 'cp' | 'qp' | 'meta'
    ) {
        if(this.name.length === 0) {
            throw new Error('Variable name can not be empty string');
        }
        this.uniqueIdentifier = `${this.type}.${this.name}`;
        this.notes = null;
        this.alias = null;
    }

    setNotes(notes: string | null) {
        this.notes = notes;
        return this;
    }

    getNotes(): string | null {
        return this.notes;
    }

    setAlias(alias: string | null) {
        this.alias = alias;
        return this;
    }

    getAlias(): string | null {
        return this.alias;
    }

    getHash() {
            const content = {
                id: this.id,
                name: this.name,
                type: this.type,
                notes: this.notes,
                alias: this.alias
            };
            return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
    }

    equals(variable: Variable) {
        if (variable === this) {
            return true;
        }
        if (this.id !== variable.id ||
            this.name !== variable.name ||
            this.type !== variable.type ||
            this.getAlias() !== variable.getAlias() ||
            this.getNotes() !== variable.getNotes()
        ) {
            return false;
        }
        return true;
    }
}