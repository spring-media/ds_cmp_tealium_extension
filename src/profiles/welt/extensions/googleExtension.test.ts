import { googleExtension } from './googleExtension';

describe('googleExtension', ()=> {
    it('it does something', ()=> {
        const b = {};
        googleExtension(undefined,b);
        expect(b).toBe({});
    })
});