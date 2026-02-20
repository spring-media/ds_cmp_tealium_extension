import crypto from 'node:crypto';
import { TagDataMapping } from './TealiumAPI';

export class Tag {
    public readonly uniqueIdentifier: string;
    private notes: string | null;
    private status: string;
    private dataMapping: TagDataMapping[] | null;

    constructor(
        public readonly id: number,
        public readonly name: string
    ) {
        if (!name || name.trim() === '') {
            throw new Error('Tag name cannot be empty');
        }
        this.uniqueIdentifier = `tag.${this.id}`;
        this.notes = null;
        this.status = 'active';
        this.dataMapping = [];
    }

    setNotes(notes: string | null): Tag {
        this.notes = notes;
        return this;
    }

    getNotes(): string | null {
        return this.notes;
    }

    setStatus(status: string): Tag {
        if (status !== 'active' && status !== 'inactive') {
            throw new Error('Status must be "active" or "inactive"');
        }
        this.status = status;
        return this;
    }

    getStatus(): string {
        return this.status;
    }

    setDataMapping(dataMapping: TagDataMapping[] | null): Tag {
        this.dataMapping = dataMapping;
        return this;
    }

    getDataMapping(): TagDataMapping[] | null {
        return this.dataMapping;
    }

    getReferencedVariables(): string[] {
        return this.dataMapping?.map(m => m.variable) || [];
    }

    getHash(): string {
        const content = {
            id: this.id,
            name: this.name,
            status: this.status,
            notes: this.notes,
            dataMappings: this.dataMapping
        };
        return crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex');
    }
}
