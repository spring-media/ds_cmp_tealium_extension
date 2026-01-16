/**
 * Tests for cookie_deprecation_label.js
 * Cookie Deprecation Label tracking
 */

const { processCookieDeprecationLabel } = require('../../extensions/welt/cookie_deprecation_label');

describe('Cookie Deprecation Label Tracking', () => {
    let originalNavigator;
    let mockUtag;
    let mockConsole;

    beforeEach(() => {
        // Store original navigator
        originalNavigator = global.navigator;

        // Mock utag.data
        mockUtag = {
            data: {}
        };
        global.utag = mockUtag;

        // Mock console
        mockConsole = {
            log: jest.fn(),
            error: jest.fn()
        };
        global.console = mockConsole;
    });

    afterEach(() => {
        jest.restoreAllMocks();
        global.navigator = originalNavigator;
        delete global.utag;
        delete global.console;
    });

    describe('API Detection', () => {
        it('should not process when cookieDeprecationLabel API is not available', () => {
            const mockNav = {};

            processCookieDeprecationLabel(mockNav);

            expect(mockUtag.data.sandbox).toBeUndefined();
        });

        it('should not process when cookieDeprecationLabel is undefined', () => {
            const mockNav = {
                cookieDeprecationLabel: undefined
            };

            processCookieDeprecationLabel(mockNav);

            expect(mockUtag.data.sandbox).toBeUndefined();
        });

        it('should not process when navigator is null', () => {
            processCookieDeprecationLabel(null);

            expect(mockUtag.data.sandbox).toBeUndefined();
        });
    });

    describe('Label Value Handling', () => {
        it('should store label value in utag.data.sandbox', async () => {
            const mockLabel = 'test_label_123';
            const mockNav = {
                cookieDeprecationLabel: {
                    getValue: jest.fn().mockResolvedValue(mockLabel)
                }
            };

            processCookieDeprecationLabel(mockNav);

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockUtag.data.sandbox).toBe(mockLabel);
            expect(mockConsole.log).toHaveBeenCalledWith(mockLabel);
        });

        it('should store empty string when label is null', async () => {
            const mockNav = {
                cookieDeprecationLabel: {
                    getValue: jest.fn().mockResolvedValue(null)
                }
            };

            processCookieDeprecationLabel(mockNav);

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockUtag.data.sandbox).toBe('');
            expect(mockConsole.log).toHaveBeenCalledWith(null);
        });

        it('should store empty string when label is empty string', async () => {
            const mockNav = {
                cookieDeprecationLabel: {
                    getValue: jest.fn().mockResolvedValue('')
                }
            };

            processCookieDeprecationLabel(mockNav);

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockUtag.data.sandbox).toBe('');
        });

        it('should store empty string when label is undefined', async () => {
            const mockNav = {
                cookieDeprecationLabel: {
                    getValue: jest.fn().mockResolvedValue(undefined)
                }
            };

            processCookieDeprecationLabel(mockNav);

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockUtag.data.sandbox).toBe('');
        });
    });

    describe('Error Handling', () => {
        it('should handle promise rejection gracefully', async () => {
            const mockNav = {
                cookieDeprecationLabel: {
                    getValue: jest.fn().mockRejectedValue(new Error('Promise rejected'))
                }
            };

            processCookieDeprecationLabel(mockNav);

            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockConsole.error).toHaveBeenCalled();
            expect(mockConsole.error.mock.calls[0][0]).toContain(
                '[COOKIE DEPRECATION LABEL] Error:'
            );
        });

        it('should handle missing utag object gracefully', async () => {
            delete global.utag;
            const mockLabel = 'example_label_1';
            const mockNav = {
                cookieDeprecationLabel: {
                    getValue: jest.fn().mockResolvedValue(mockLabel)
                }
            };

            expect(() => processCookieDeprecationLabel(mockNav)).not.toThrow();

            await new Promise(resolve => setTimeout(resolve, 10));

            // Should not crash even without utag, but won't log either
            expect(mockNav.cookieDeprecationLabel.getValue).toHaveBeenCalled();
            expect(mockConsole.log).not.toHaveBeenCalled();
        });

        it('should handle missing utag.data gracefully', async () => {
            delete mockUtag.data;
            const mockLabel = 'example_label_1';
            const mockNav = {
                cookieDeprecationLabel: {
                    getValue: jest.fn().mockResolvedValue(mockLabel)
                }
            };

            processCookieDeprecationLabel(mockNav);

            await new Promise(resolve => setTimeout(resolve, 10));

            // Should not crash even without utag.data, but won't log either
            expect(mockNav.cookieDeprecationLabel.getValue).toHaveBeenCalled();
            expect(mockConsole.log).not.toHaveBeenCalled();
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle multiple sequential calls', async () => {
            const mockLabel1 = 'label_1';
            const mockLabel2 = 'label_2';

            const mockNav = {
                cookieDeprecationLabel: {
                    getValue: jest
                        .fn()
                        .mockResolvedValueOnce(mockLabel1)
                        .mockResolvedValueOnce(mockLabel2)
                }
            };

            processCookieDeprecationLabel(mockNav);
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockUtag.data.sandbox).toBe(mockLabel1);

            processCookieDeprecationLabel(mockNav);
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockUtag.data.sandbox).toBe(mockLabel2);
        });
    });
});
