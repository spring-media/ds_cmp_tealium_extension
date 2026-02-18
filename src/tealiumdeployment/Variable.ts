export class Variable {

    public readonly uniqueIdentifier: string;
    private notes: string | null;

    constructor(
        public readonly id: number, 
        public readonly name: string,
        public readonly type: 'udo' | 'cp'
    ) {
        if(this.name.length === 0) {
            throw new Error('Variable name can not be empty string');
        }
        this.uniqueIdentifier = `${this.type}.${this.name}`;
        this.notes = null;
    }

    setNotes(notes: string | null) {
        this.notes = notes;
    }

    getNotes(): string | null {
        return this.notes;
    }
}