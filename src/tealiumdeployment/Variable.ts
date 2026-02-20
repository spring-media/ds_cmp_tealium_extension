import crypto from 'node:crypto';

export class Variable {

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
}