import { googleExtension, googleExtensionPropens, googleExtensionConversion } from './googleExtensionFuncs';

describe('googleExtension', ()=> {
    it('it does something', ()=> {
        const b: any = {};
        googleExtension(undefined,b);
        expect(b.a_rand).toBeDefined();
    })
    it('it gps_userEvent is set', ()=> {
        const b: any = {
            page_isPremium: true,
            'cp.utag_main_va': false
        };
        googleExtensionConversion(undefined,b);
        expect(b.gps_userEvent).toBeDefined();
        expect(b.gps_userEvent).toBe('paywall');
    })
 
    it('it does something', ()=> {
        Object.defineProperty(global, "sessionStorage", { value: {getItem:()=>{return 'justATest'}}})
 
        const b: any = {};
        googleExtensionPropens(undefined,b);
        expect(b.google_propens).toBeDefined();
    })
});