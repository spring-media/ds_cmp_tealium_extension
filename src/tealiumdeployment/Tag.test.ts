import { Tag } from './Tag';
import { TagDataMapping } from './TealiumAPI';

describe('Tag', () => {

    it('has an ID', () => {
        const tag = new Tag(210, 'Google Analytics 4');
        expect(tag.id).toBe(210);
    });

    it('has a name', () => {
        const tag = new Tag(210, 'Google Analytics 4');
        expect(tag.name).toBe('Google Analytics 4');
    });

    it('has a status', () => {
        const tagA = new Tag(210, 'GA4');
        expect(tagA.getStatus()).toBe('active');

        const tagB = new Tag(210, 'GA4');
        tagB.setStatus('inactive');
        expect(tagB.getStatus()).toBe('inactive');
    });

    describe('create new instance', () => {
        it('does not allow empty names', () => {
            expect(() => new Tag(210, 'test')).not.toThrow();
            expect(() => new Tag(210, '')).toThrow('Tag name cannot be empty');
            expect(() => new Tag(210, '   ')).toThrow('Tag name cannot be empty');
        });

        it('validates status values', () => {
            const tag = new Tag(210, 'GA4');
            expect(() => tag.setStatus('active')).not.toThrow();
            expect(() => tag.setStatus('inactive')).not.toThrow();
            expect(() => tag.setStatus('invalid')).toThrow('Status must be "active" or "inactive"');
        });
    });

    describe('uniqueIdentifier', () => {
        it('returns a combination of tag prefix and id', () => {
            const tagA = new Tag(210, 'Google Analytics 4');
            expect(tagA.uniqueIdentifier).toBe('tag.210');

            const tagB = new Tag(233, 'Facebook Pixel');
            expect(tagB.uniqueIdentifier).toBe('tag.233');
        });
    });

    describe('notes', () => {
        it('has no notes by default', () => {
            const tag = new Tag(210, 'GA4');
            expect(tag.getNotes()).toBe(null);
        });

        it('can have notes', () => {
            const tag = new Tag(210, 'GA4');
            tag.setNotes('Main analytics tag');
            expect(tag.getNotes()).toBe('Main analytics tag');
        });
    });

    describe('dataMapping', () => {
        it('has empty data mapping by default', () => {
            const tag = new Tag(210, 'GA4');
            expect(tag.getDataMapping()).toEqual([]);
        });

        it('can have data mappings', () => {
            const tag = new Tag(210, 'GA4');
            const mappings: TagDataMapping[] = [
                { variable: 'page_name', type: 'udo', mappings: ['page_title'] }
            ];
            tag.setDataMapping(mappings);
            expect(tag.getDataMapping()).toEqual(mappings);
        });

        it('can be set to null', () => {
            const tag = new Tag(210, 'GA4');
            tag.setDataMapping(null);
            expect(tag.getDataMapping()).toBe(null);
        });
    });

    describe('getReferencedVariables', () => {
        it('returns empty array when no mappings', () => {
            const tag = new Tag(210, 'GA4');
            expect(tag.getReferencedVariables()).toEqual([]);
        });

        it('returns empty array when mappings is null', () => {
            const tag = new Tag(210, 'GA4');
            tag.setDataMapping(null);
            expect(tag.getReferencedVariables()).toEqual([]);
        });

        it('returns variable names from mappings', () => {
            const tag = new Tag(210, 'GA4');
            tag.setDataMapping([
                { variable: 'page_name', type: 'udo', mappings: ['page_title'] },
                { variable: 'user_segment', type: 'udo', mappings: ['user_property'] }
            ]);
            expect(tag.getReferencedVariables()).toEqual(['page_name', 'user_segment']);
        });
    });

    describe('getHash', () => {
        it('is based on id, name, status, notes and dataMappings', () => {
            const tag = new Tag(210, 'GA4')
                .setStatus('active')
                .setNotes('Main tag')
                .setDataMapping([
                    { variable: 'page_name', type: 'udo', mappings: ['page_title'] }
                ]);
            expect(tag.getHash()).toBe('b8210b1afd0674ffd6c0314eae3442eed7527e4be70cab8c5b74c5c0e456ece5');
        });

        it('changes if id changes', () => {
            const tag1 = new Tag(210, 'GA4').setNotes('Test');
            const tag2 = new Tag(211, 'GA4').setNotes('Test');
            expect(tag1.getHash()).not.toBe(tag2.getHash());
        });

        it('changes if name changes', () => {
            const tag1 = new Tag(210, 'GA4').setNotes('Test');
            const tag2 = new Tag(210, 'GA4 Updated').setNotes('Test');
            expect(tag1.getHash()).not.toBe(tag2.getHash());
        });

        it('changes if status changes', () => {
            const tag1 = new Tag(210, 'GA4').setStatus('active');
            const tag2 = new Tag(210, 'GA4').setStatus('inactive');
            expect(tag1.getHash()).not.toBe(tag2.getHash());
        });

        it('changes if notes changes', () => {
            const tag1 = new Tag(210, 'GA4').setNotes('Note 1');
            const tag2 = new Tag(210, 'GA4').setNotes('Note 2');
            expect(tag1.getHash()).not.toBe(tag2.getHash());
        });

        it('changes if dataMappings changes', () => {
            const tag1 = new Tag(210, 'GA4').setDataMapping([
                { variable: 'page_name', type: 'udo', mappings: ['page_title'] }
            ]);
            const tag2 = new Tag(210, 'GA4').setDataMapping([
                { variable: 'user_id', type: 'udo', mappings: ['user_cookie'] }
            ]);
            expect(tag1.getHash()).not.toBe(tag2.getHash());
        });
    });
});
