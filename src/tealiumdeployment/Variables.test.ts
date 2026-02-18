import { Variable } from './Variable';

describe('Variables', () => {

    it('has an ID', ()=> {
        const variable = new Variable(123, 'TestVariable', 'udo');
        expect(variable.id).toBe(123);
    });

    it('has a name', ()=> {
        const variable = new Variable(123, 'TestVariable', 'udo');
        expect(variable.name).toBe('TestVariable');
    })

    it('has a type', ()=> {
        const variable = new Variable(123, 'TestVariable', 'udo');
        expect(variable.type).toBe('udo');

        //TODO cp and qp meta
    })

    describe('create new instance', () => {
        it('does not allow empty names', () => {
            expect(()=> new Variable(123, 'test', 'udo')).not.toThrow();
            expect(()=> new Variable(123, '', 'udo')).toThrow('Variable name can not be empty string');
        });
    });

    describe('uniqueIdentifier', () => {
        it('returns a combination of name and type', () => {
            const variableA = new Variable(123, 'ad_suite', 'udo');
            expect(variableA.uniqueIdentifier).toBe('udo.ad_suite');

            const variableB = new Variable(123, 'ad_suite', 'cp');
            expect(variableB.uniqueIdentifier).toBe('cp.ad_suite');
        });
    });

    describe('notes', () => {

        it('has no notes by default', ()=> {
            const variable = new Variable(123, 'ad_suite', 'udo');
            expect(variable.getNotes()).toBe(null);
        });

        it('can have notes', ()=> {
            const variable = new Variable(123, 'ad_suite', 'udo');
            variable.setNotes('My test note');
            expect(variable.getNotes()).toBe('My test note');
        });
    })
});