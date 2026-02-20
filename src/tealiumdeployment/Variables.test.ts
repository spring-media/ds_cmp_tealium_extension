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
        const variableA = new Variable(123, 'TestVariable', 'udo');
        expect(variableA.type).toBe('udo');

        const variableB = new Variable(123, 'TestVariable', 'cp');
        expect(variableB.type).toBe('cp');

        const variableC = new Variable(123, 'TestVariable', 'qp');
        expect(variableC.type).toBe('qp');

        const variableD = new Variable(123, 'TestVariable', 'meta');
        expect(variableD.type).toBe('meta');
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
    });

    describe('alias', () => {

        it('has no alias by default', ()=> {
            const variable = new Variable(123, 'ad_suite', 'udo');
            expect(variable.getAlias()).toBe(null);
        });

        it('can have notes', ()=> {
            const variable = new Variable(123, 'ad_suite', 'udo');
            variable.setAlias('MySpecialVariable');
            expect(variable.getAlias()).toBe('MySpecialVariable');
        });
    });

    describe('getHash', () => {
        it('is based on id, name, type, alias and notes', ()=>{
            const variable = new Variable(1, 'test', 'udo')
                .setAlias('Im a variable')
                .setNotes('Hello World!');
            expect(variable.getHash()).toBe('1c0b15a816e099b494ba418213c42b1600c2db32ce7f276910673390117154f6');
        });

        it('changes if id changes', ()=>{
            const variable = new Variable(2, 'test', 'udo')
                .setAlias('Im a variable')
                .setNotes('Hello World!');
            expect(variable.getHash()).toBe('edd0c355feb79888a7484a02204d21abc4f22c2f95c960f17c4077b1452479c1');
        });

        it('changes if name changes', ()=>{
            const variable = new Variable(1, 'test-abc', 'udo')
                .setAlias('Im a variable')
                .setNotes('Hello World!');
            expect(variable.getHash()).toBe('bcc95b10d0afea5cf666deb91440337462bfd1a3261c57626eaae0a646e287ef');
        });

        it('changes if type changes', ()=>{
            const variable = new Variable(1, 'test', 'cp')
                .setAlias('Im a variable')
                .setNotes('Hello World!');
            expect(variable.getHash()).toBe('acf702c37b265d68c4fbf39a885091586983ac396475d784ae2eea2f215a2c10');
        });

        it('changes if alias changes', ()=>{
            const variable = new Variable(1, 'test', 'udo')
                .setAlias('Im another variable')
                .setNotes('Hello World!');
            expect(variable.getHash()).toBe('947152b133f84ef25696e2f2b0b15533fd74de35e8566f9eb914027329657903');
        });

        it('changes if notes changes', ()=>{
            const variable = new Variable(1, 'test', 'udo')
                .setAlias('Im another variable')
                .setNotes('Just a test');
            expect(variable.getHash()).toBe('03125e56800229c3e0ffc8063f9f358d4e2e1b23e7882c21912f48d90cad107d');
        });
    })
});