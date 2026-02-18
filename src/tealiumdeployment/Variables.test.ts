import { Variable } from './Variable';

describe('Variables', () => {

    it('has an ID', ()=> {
        const variable = new Variable(123, 'TestVariable');
        expect(variable.id).toBe(123);
    });

    it('has a name', ()=> {
        const variable = new Variable(123, 'TestVariable');
        expect(variable.name).toBe('TestVariable');
    })
});