import axios from 'axios';
import { Occurrence, Status, TealiumAPI, Scope } from './TealiumAPI';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const accountName = 'tealium-account';
const profileName = 'test-profile';

const simulateConnectionSucessful = () => {
    mockedAxios.post.mockImplementation((url) => {
        if (url.includes('https://platform.tealiumapis.com/v3/auth/accounts')) {
            return Promise.resolve({
                status: 200,
                data: { token: 'testtokenABC123', host: 'test.tealium.com' },
                message: 'Ok'
            });
        }
        return Promise.reject(new Error('Unexpected URL'));
    });
};

const simulateConntectionUnauthorized = () => {
    mockedAxios.post.mockImplementation((url) => {
        if (url.includes('https://platform.tealiumapis.com/v3/auth/accounts')) {
            return Promise.reject({
                status: 401,
                message: 'Unauthorized'
            });
        }
        return Promise.reject(new Error('Unexpected URL'));
    });
};

const simulateConnectionAccepted = () => {
    mockedAxios.post.mockImplementation((url) => {
        if (url.includes('https://platform.tealiumapis.com/v3/auth/accounts')) {
            return Promise.resolve({
                status: 201,
                message: 'Accepted'
            });
        }
        return Promise.reject(new Error('Unexpected URL'));
    });
};

const simulateGetProfileInternalError = () => {
    mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/v3/tiq/accounts/')) {
            return Promise.reject({
                status: 500,
                message: 'Internal Error'
            });
        }
        return Promise.reject(new Error('Unexpected URL'));
    });
};

const simulateGetProfileSucessful = () => {
    mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/v3/tiq/accounts/')) {
            return Promise.resolve({
                status: 200,
                data: { },
                message: 'Ok'
            });
        }
        return Promise.reject(new Error('Unexpected URL'));
    });
};

const simulatePatchInternalError = () => {
    mockedAxios.patch.mockImplementation((url) => {
        if (url.includes('/v3/tiq/accounts/')) {
            return Promise.reject({
                status: 500,
                message: 'Internal Error'
            });
        }
        return Promise.reject(new Error('Unexpected URL'));
    });
};

const simulatePatchSuccessful = () => {
    mockedAxios.patch.mockImplementation((url) => {
        if (url.includes('/v3/tiq/accounts/')) {
            return Promise.resolve({
                status: 200,
                message: 'Ok'
            });
        }
        return Promise.reject(new Error('Unexpected URL'));
    });
};

const simulatePatchAccepted = () => {
    mockedAxios.patch.mockImplementation((url) => {
        if (url.includes('/v3/tiq/accounts/')) {
            return Promise.resolve({
                status: 201,
                message: 'Accepted'
            });
        }
        return Promise.reject(new Error('Unexpected URL'));
    });
};

describe('TealiumAPI', () => {

    const fakeUser = 'fakeUser';
    const fakeApiKey = 'fakeApiKeyABC123';

    beforeEach(() => {
        mockedAxios.get.mockClear();
        mockedAxios.post.mockClear();
        mockedAxios.patch.mockClear();
    });

    describe('connecting', () => {
        it('is not connected by default', () => {
            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            expect(tealium.isConnected()).toBe(false);
        });

        it('throws if login fails', async () => {
            simulateConntectionUnauthorized();
            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            expect(async () => {
                await tealium.connect(accountName, profileName);
            }).rejects.toThrow('Auth failed. Unauthorized');
        });

        it('is connected if connection is successful (200)', async () => {
            simulateConnectionSucessful();
            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            const response = await tealium.connect(accountName, profileName);
            expect(response).toBe(true);
            expect(tealium.isConnected()).toBe(true);
        });

        it('is not connected if connection is only accepted (201)', async () => {
            /* Accepted (201) used to not trigger exception within axios */
            simulateConnectionAccepted();
            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            const response = await tealium.connect(accountName, profileName);
            expect(response).toBe(false);
            expect(tealium.isConnected()).toBe(false);
        });

        it('sets connectionDetails if connection sucessful (200)', async () => {
            simulateConnectionSucessful();
            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);

            expect(tealium.getConnectionDetails()).toEqual({
                host: null,
                account: null,
                profile: null
            });

            const response = await tealium.connect(accountName, profileName);
            expect(response).toBe(true);
            expect(tealium.isConnected()).toBe(true);

            expect(tealium.getConnectionDetails()).toEqual({
                host: 'test.tealium.com',
                account: 'tealium-account',
                profile: 'test-profile'
            });
        });

        it('not sets connectionDetails if connection only accepted (201)', async () => {
            /* Accepted (201) used to not trigger exception within axios */
            simulateConnectionAccepted();
            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);

            expect(tealium.getConnectionDetails()).toEqual({
                host: null,
                account: null,
                profile: null
            });

            const response = await tealium.connect(accountName, profileName);
            expect(response).toBe(false);
            expect(tealium.isConnected()).toBe(false);

            expect(tealium.getConnectionDetails()).toEqual({
                host: null,
                account: null,
                profile: null
            });
        });

        describe('request details', () => {
            it('uses correct host and header', async () => {
                simulateConnectionSucessful();

                const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
                await tealium.connect('axelspringer', 'test-solutions2');

                // Verify axios.post was called
                expect(mockedAxios.post).toHaveBeenCalledTimes(1);

                // Get the call arguments
                const callArgs = mockedAxios.post.mock.calls[0];
                const url = callArgs?.[0];
                const body = callArgs?.[1] as URLSearchParams;
                const config = callArgs?.[2];

                // Verify URL
                expect(url).toBe('https://platform.tealiumapis.com/v3/auth/accounts/axelspringer/profiles/test-solutions2');

                // Verify body contains correct parameters
                expect(body).toBeInstanceOf(URLSearchParams);
                expect(body.get('username')).toBe(fakeUser);
                expect(body.get('key')).toBe(fakeApiKey);

                // Verify headers
                expect(config?.headers).toEqual({
                    'Content-Type': 'application/x-www-form-urlencoded'
                });
            });
        });
    });

    describe('getExtensions', () => {
        it('throws if not connected', async () => {
            expect(async () => {
                const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
                await tealium.getProfile();
            }).rejects.toThrow('TealiumAPI not connected.');
        });

        it('it throws if connected and response failed', async () => {
            simulateConnectionSucessful();
            simulateGetProfileInternalError();

            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            await tealium.connect('axelspringer', 'test-solutions2');

            expect(async () => {
                await tealium.getProfile();
            }).rejects.toThrow('GetProfile failed. Internal Error');
        });

        describe('request details', () => {
            it('uses correct host and header', async () => {
                simulateConnectionSucessful();
                simulateGetProfileSucessful();

                const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
                await tealium.connect(accountName, 'test-profile');

                await tealium.getProfile();

                // Verify axios.post was called
                expect(mockedAxios.get).toHaveBeenCalledTimes(1);

                // // Get the call arguments
                const callArgs = mockedAxios.get.mock.calls[0];
                const url = callArgs?.[0];
                const config = callArgs?.[1];

                // Verify URL
                expect(url).toBe('https://test.tealium.com/v3/tiq/accounts/tealium-account/profiles/test-profile?includes=loadRules&includes=extensions&includes=tags&includes=tags.template&includes=variables&includes=events&includes=versionIds');

                // Verify headers
                expect(config?.headers).toEqual({
                    'Authorization': 'Bearer testtokenABC123',
                    'Accept': 'application/json'
                });
            });
        });
    });

    describe('deploy', () => {
        it('throws if not connected', async () => {
            expect(async () => {
                const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
                const fakePayLoad = { thisIs: 'justAFake' };
                await tealium.deploy(fakePayLoad);
            }).rejects.toThrow('TealiumAPI not connected.');
        });

        it('it throws if connected and response failed', async () => {
            simulateConnectionSucessful();
            simulatePatchInternalError();

            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            await tealium.connect('axelspringer', 'test-solutions2');

            expect(async () => {
                const fakePayLoad = { thisIs: 'justAFake' };
                await tealium.deploy(fakePayLoad);
            }).rejects.toThrow('Deploy failed. Internal Error');
        });

        it('succeeds if patch respondes with 200', async () => {
            simulateConnectionSucessful();
            simulatePatchSuccessful();

            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            await tealium.connect('axelspringer', 'test-solutions2');

            const fakePayLoad = { thisIs: 'justAFake' };
            const response = await tealium.deploy(fakePayLoad);
            expect(response).toBe(true);
        });


        it('fails if patch receives something else than 200', async () => {
            /* Accepted (201) used to not trigger exception within axios */
            simulateConnectionSucessful();
            simulatePatchAccepted();

            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            await tealium.connect('axelspringer', 'test-solutions2');

            const fakePayLoad = { thisIs: 'justAFake' };
            const response = await tealium.deploy(fakePayLoad);
            expect(response).toBe(false);
        });


        describe('request details', () => {
            it('uses correct host and header', async () => {
                simulateConnectionSucessful();

                const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
                await tealium.connect(accountName, 'test-profile');


                const fakePayLoad = { thisIs: 'justAFake' };

                await tealium.deploy(fakePayLoad);

                // Verify axios.post was called
                expect(mockedAxios.patch).toHaveBeenCalledTimes(1);

                // // Get the call arguments
                const callArgs = mockedAxios.patch.mock.calls[0];
                const url = callArgs?.[0];
                const config = callArgs?.[2];

                // // Verify URL
                expect(url).toBe('https://test.tealium.com/v3/tiq/accounts/tealium-account/profiles/test-profile');

                // Verify headers
                expect(config?.headers).toEqual({
                    'Authorization': 'Bearer testtokenABC123',
                    'Content-Type': 'application/json'
                });
            });
        });
    });

    describe('buildCreatePayload', () => {
        it('creates valid payload with minimal params', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildCreatePayload({
                name: 'Test Extension',
                code: 'console.log("test");',
                deploymentNotes: 'just a test'
            });

            expect(payload.saveType).toBe('saveAs');
            expect(payload.operationList).toHaveLength(1);
            expect(payload.operationList[0]!.op).toBe('add');
            expect(payload.operationList[0]!.path).toBe('/extensions');
            expect(payload.operationList[0]!.value.name).toBe('Test Extension');
            expect(payload.operationList[0]!.value.configuration[0].value).toBe('console.log("test");');
        });

        it('uses default values for optional params', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildCreatePayload({
                name: 'Test Extension',
                code: 'console.log("test");',
                deploymentNotes: 'just a test'
            });

            const extension = payload.operationList[0]!.value;
            expect(extension.scope).toBe('After Load Rules');
            expect(extension.selectedTargets).toEqual({
                dev: true,
                qa: true,
                prod: true
            });
            expect(extension.notes).toBe('');
            expect(payload.notes).toBe('just a test');
        });

        it('respects custom scope and targets', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildCreatePayload({
                name: 'Test Extension',
                code: 'console.log("test");',
                scope: Scope.BeforeLoadRules,
                deploymentNotes: 'just a test',
                targets: { dev: true, qa: false, prod: false }
            });

            const extension = payload.operationList[0]!.value;
            expect(extension.scope).toBe('Before Load Rules');
            expect(extension.selectedTargets).toEqual({
                dev: true,
                qa: false,
                prod: false
            });
        });

        it('includes custom notes and version title', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildCreatePayload({
                name: 'Test Extension',
                code: 'console.log("test");',
                extensionNotes: 'Extension level notes',
                deploymentNotes: 'Deployment level notes',
                versionTitle: 'v1.2.3'
            });

            expect(payload.versionTitle).toBe('v1.2.3');
            expect(payload.notes).toBe('Deployment level notes');
            expect(payload.operationList[0]!.value.notes).toBe('Extension level notes');
        });

        it('generates timestamp-based version title if not provided', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildCreatePayload({
                name: 'Test Extension',
                code: 'console.log("test");',
                deploymentNotes: 'just a test'
            });

            expect(payload.versionTitle).toContain('Deploy');
            expect(payload.versionTitle).toMatch(/\d{4}-\d{2}-\d{2}/);
        });
    });

    describe('buildUpdatePayload', () => {
        it('creates valid update payload with extension ID', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildUpdatePayload(123, {
                name: 'Updated Extension',
                code: 'console.log("updated");',
                deploymentNotes: 'just a test',
                occurrence: Occurrence.RunAlways,
                status: Status.Inactive
            });

            expect(payload.saveType).toBe('saveAs');
            expect(payload.operationList).toHaveLength(1);
            expect(payload.operationList[0]!.op).toBe('replace');
            expect(payload.operationList[0]!.path).toBe('/extensions/123');
            expect(payload.operationList[0]!.value.name).toBe('[A] Updated Extension');
            expect(payload.operationList[0]!.value.occurrence).toBe('Run Always');
            expect(payload.operationList[0]!.value.status).toBe('inactive');
            expect(payload.operationList[0]!.value.configuration[0].value).toBe('console.log("updated");');
        });

        it('uses default values for optional params', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildUpdatePayload(123, {
                name: 'Updated Extension',
                code: 'console.log("updated");',
                deploymentNotes: 'just a test',
                occurrence: Occurrence.RunOnce,
                status: Status.Inactive
            });

            const extension = payload.operationList[0]!.value;
            expect(extension.scope).toBe('After Load Rules');
            expect(extension.selectedTargets).toEqual({
                dev: true,
                qa: true,
                prod: true
            });
        });

        it('respects custom scope and targets', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildUpdatePayload(123, {
                name: 'Updated Extension',
                code: 'console.log("updated");',
                scope: Scope.DOMReady,
                deploymentNotes: 'just a test',
                occurrence: Occurrence.RunOnce,
                status: Status.Inactive,
                targets: { dev: false, qa: true, prod: true }
            });

            const extension = payload.operationList[0]!.value;
            expect(extension.scope).toBe('DOM Ready');
            expect(extension.selectedTargets).toEqual({
                dev: false,
                qa: true,
                prod: true
            });
        });

        it('includes custom notes and version title', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildUpdatePayload(123, {
                name: 'Updated Extension',
                code: 'console.log("updated");',
                extensionNotes: 'PR #42 by user@example.com',
                deploymentNotes: 'Hotfix deployment',
                versionTitle: 'v2.0.0',
                occurrence: Occurrence.RunOnce,
                status: Status.Inactive
            });

            expect(payload.versionTitle).toBe('v2.0.0');
            expect(payload.notes).toBe('Hotfix deployment');
            expect(payload.operationList[0]!.value.notes).toBe('PR #42 by user@example.com');
        });

        it('generates timestamp-based version title if not provided', () => {
            const tealium = new TealiumAPI(fakeUser, fakeApiKey);

            const payload = tealium.buildUpdatePayload(123, {
                name: 'Updated Extension',
                code: 'console.log("updated");',
                deploymentNotes: 'just a test',
                occurrence: Occurrence.RunOnce,
                status: Status.Inactive
            });

            expect(payload.versionTitle).toContain('Update');
            expect(payload.versionTitle).toMatch(/\d{4}-\d{2}-\d{2}/);
        });
    });
});
