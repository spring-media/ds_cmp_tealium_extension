/**
 * Tests for brandstory_milestones.js
 * Brandstory Milestones Tracking for Welt
 */

describe('Brandstory Milestones', () => {
    let checkBrandstoryConditions;
    let getDomainTagValue;

    beforeEach(() => {
        // Clear the module cache to ensure fresh imports with new window/document
        jest.resetModules();
    });

    describe('getDomainTagValue', () => {
        beforeEach(() => {
            // Import after setting up the environment
            const module = require('../../../extensions/welt/brandstory/brandstory_milestones');
            getDomainTagValue = module.getDomainTagValue;
        });

        it('should return [206] for welt.de domain', () => {
            const result = getDomainTagValue('www.welt.de');
            expect(result).toEqual([206]);
        });

        it('should return empty array for non-welt domain', () => {
            const result = getDomainTagValue('www.example.com');
            expect(result).toEqual([]);
        });
    });

    describe('checkBrandstoryConditions', () => {
        it('should return false when adobe_analytics is not consented', () => {
            delete window.location;
            window.location = {
                href: 'https://www.welt.de/sponsored/article',
                hostname: 'www.welt.de'
            };
            window.utag = {
                data: {
                    consentedVendors: ['other_vendor'],
                    page_type: 'article'
                }
            };
            document.cookie = 'hasPurSubscription=false';

            const module = require('../../../extensions/welt/brandstory/brandstory_milestones');
            checkBrandstoryConditions = module.checkBrandstoryConditions;

            expect(checkBrandstoryConditions()).toBe(false);
        });

        it('should return false when hasPurSubscription cookie is true', () => {
            delete window.location;
            window.location = {
                href: 'https://www.welt.de/sponsored/article',
                hostname: 'www.welt.de'
            };
            window.utag = {
                data: {
                    consentedVendors: ['adobe_analytics'],
                    page_type: 'article'
                }
            };
            document.cookie = 'hasPurSubscription=true';

            const module = require('../../../extensions/welt/brandstory/brandstory_milestones');
            checkBrandstoryConditions = module.checkBrandstoryConditions;

            expect(checkBrandstoryConditions()).toBe(false);
        });

        it('should return true for sponsored content with article page_type', () => {
            delete window.location;
            window.location = {
                href: 'https://www.welt.de/sponsored/article-title',
                hostname: 'www.welt.de'
            };
            window.utag = {
                data: {
                    consentedVendors: ['adobe_analytics'],
                    page_type: 'article'
                }
            };
            document.cookie = 'hasPurSubscription=false';

            const module = require('../../../extensions/welt/brandstory/brandstory_milestones');
            checkBrandstoryConditions = module.checkBrandstoryConditions;

            expect(checkBrandstoryConditions()).toBe(true);
        });

        it('should return true for advertorials with article page_type', () => {
            delete window.location;
            window.location = {
                href: 'https://www.welt.de/advertorials/article-title',
                hostname: 'www.welt.de'
            };
            window.utag = {
                data: {
                    consentedVendors: ['adobe_analytics'],
                    page_type: 'article'
                }
            };
            document.cookie = 'hasPurSubscription=false';

            const module = require('../../../extensions/welt/brandstory/brandstory_milestones');
            checkBrandstoryConditions = module.checkBrandstoryConditions;

            expect(checkBrandstoryConditions()).toBe(true);
        });

        it('should return true for brand-story keyword with article page_type', () => {
            delete window.location;
            window.location = {
                href: 'https://www.welt.de/article',
                hostname: 'www.welt.de'
            };
            window.utag = {
                data: {
                    consentedVendors: ['adobe_analytics'],
                    page_type: 'article',
                    page_keywords_string: 'keyword1,brand-story,keyword2'
                }
            };
            document.cookie = 'hasPurSubscription=false';

            const module = require('../../../extensions/welt/brandstory/brandstory_milestones');
            checkBrandstoryConditions = module.checkBrandstoryConditions;

            expect(checkBrandstoryConditions()).toBe(true);
        });

        it('should return true for product-story-selection keyword', () => {
            delete window.location;
            window.location = {
                href: 'https://www.welt.de/article',
                hostname: 'www.welt.de'
            };
            window.utag = {
                data: {
                    consentedVendors: ['adobe_analytics'],
                    page_type: 'article',
                    page_keywords_string: 'product-story-selection'
                }
            };
            document.cookie = 'hasPurSubscription=false';

            const module = require('../../../extensions/welt/brandstory/brandstory_milestones');
            checkBrandstoryConditions = module.checkBrandstoryConditions;

            expect(checkBrandstoryConditions()).toBe(true);
        });

        it('should return true for productstorys in URL with article page_type', () => {
            delete window.location;
            window.location = {
                href: 'https://www.welt.de/productstorys/article-title',
                hostname: 'www.welt.de'
            };
            window.utag = {
                data: {
                    consentedVendors: ['adobe_analytics'],
                    page_type: 'article'
                }
            };
            document.cookie = 'hasPurSubscription=false';

            const module = require('../../../extensions/welt/brandstory/brandstory_milestones');
            checkBrandstoryConditions = module.checkBrandstoryConditions;

            expect(checkBrandstoryConditions()).toBe(true);
        });

        it('should return false when no brandstory conditions match', () => {
            delete window.location;
            window.location = {
                href: 'https://www.welt.de/news/article-title',
                hostname: 'www.welt.de'
            };
            window.utag = {
                data: {
                    consentedVendors: ['adobe_analytics'],
                    page_type: 'article',
                    page_keywords_string: 'regular,news'
                }
            };
            document.cookie = 'hasPurSubscription=false';

            const module = require('../../../extensions/welt/brandstory/brandstory_milestones');
            checkBrandstoryConditions = module.checkBrandstoryConditions;

            expect(checkBrandstoryConditions()).toBe(false);
        });
    });
});
