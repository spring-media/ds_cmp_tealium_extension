import axios from 'axios';
import { TealiumAPI } from './TealiumAPI';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const accountName = 'tealium-account';
const profileName = 'test-profile';

describe('TealiumAPI', () => {

    const fakeUser = 'fakeUser';
    const fakeApiKey = 'fakeApiKeyABC123';

    beforeEach(() => {
        mockedAxios.post.mockClear();
        mockedAxios.patch.mockClear();
    });

    describe('connecting', () => {
        it('is not connected by default', () => {
            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            expect(tealium.isConnected()).toBe(false);
        });

        it('throws if login fails', async () => {

            mockedAxios.post.mockRejectedValue({
                status: 401,
                message: 'Unauthorized'
            });

            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            expect(async () => {
                await tealium.connect(accountName, profileName);
            }).rejects.toThrow('Auth failed. Unauthorized');
        });

        it('is connected if connection is successful (200)', async () => {

            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: { token: 'testtokenABC123', host: 'test.tealium.com' },
                message: 'Ok'
            });

            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            const response = await tealium.connect(accountName, profileName);
            expect(response).toBe(true);
            expect(tealium.isConnected()).toBe(true);
        });

        it('is not connected if connection is only accepted (201)', async () => {
            mockedAxios.post.mockResolvedValue({
                status: 201,
                message: 'Accepted'
            });

            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            const response = await tealium.connect(accountName, profileName);
            expect(response).toBe(false);
            expect(tealium.isConnected()).toBe(false);
        });

        it('sets connectionDetails if connection sucessful (200)', async () => {
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: { token: 'testtokenABC123', host: 'test.tealium.com' },
                message: 'Ok'
            });

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

        it('sets connectionDetails if connection only accepted (201)', async () => {
            mockedAxios.post.mockResolvedValue({
                status: 201,
                message: 'Accepted'
            });

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
                mockedAxios.post.mockResolvedValue({
                    status: 200,
                    data: { token: 'testtokenABC123', host: 'test.tealium.com' },
                    message: 'Ok'
                });

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

    describe('deploy', () => {
        it('throws if not connected', async () => {
            expect(async () => {
                const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
                const fakePayLoad = { thisIs: 'justAFake' };
                await tealium.deploy(fakePayLoad);
            }).rejects.toThrow('TealiumAPI not connected.');
        });

        it('it throws if connected and response failed', async () => {
            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: { token: 'testtokenABC123', host: 'test.tealium.com' },
                message: 'Ok'
            });

            mockedAxios.patch.mockRejectedValue({
                status: 500,
                message: 'Internal Error'
            });

            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            await tealium.connect('axelspringer', 'test-solutions2');

            expect(async () => {
                const fakePayLoad = { thisIs: 'justAFake' };
                await tealium.deploy(fakePayLoad);
            }).rejects.toThrow('Deploy failed. Internal Error');
        });

        it('it succeeds if patch respondes with 200', async () => {

            mockedAxios.post.mockResolvedValue({
                status: 200,
                data: { token: 'testtokenABC123', host: 'test.tealium.com' },
                message: 'Ok'
            });

            mockedAxios.patch.mockResolvedValue({
                status: 200,
                message: 'Ok'
            });

            const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
            await tealium.connect('axelspringer', 'test-solutions2');

            const fakePayLoad = { thisIs: 'justAFake' };
            const response = await tealium.deploy(fakePayLoad);
            expect(response).toBe(true);

            // Negative test
            mockedAxios.patch.mockResolvedValue({
                status: 201,
                message: 'Accepted'
            });

            const response1 = await tealium.deploy(fakePayLoad);
            expect(response1).toBe(false);
        });


        describe('request details', () => {
            it('uses correct host and header', async () => {
                mockedAxios.post.mockResolvedValue({
                    status: 200,
                    data: { token: 'testtokenABC123', host: 'test.tealium.com' },
                    message: 'Ok'
                });

                const tealium: TealiumAPI = new TealiumAPI(fakeUser, fakeApiKey);
                await tealium.connect(accountName, 'test-profile');


                const fakePayLoad = { thisIs: 'justAFake' };

                await tealium.deploy(fakePayLoad);

                // Verify axios.post was called
                expect(mockedAxios.patch).toHaveBeenCalledTimes(1);

                // // Get the call arguments
                const callArgs = mockedAxios.patch.mock.calls[0];
                const url = callArgs?.[0];
                // const body = callArgs?.[1] as URLSearchParams;
                const config = callArgs?.[2];

                // // Verify URL
                expect(url).toBe('https://test.tealium.com/v3/tiq/accounts/tealium-account/profiles/test-profile');

                // // Verify body contains correct parameters
                // expect(body).toBeInstanceOf(URLSearchParams);
                // expect(body.get('username')).toBe(fakeUser);
                // expect(body.get('key')).toBe(fakeApiKey);

                // Verify headers
                expect(config?.headers).toEqual({
                    'Authorization': 'Bearer testtokenABC123',
                    'Content-Type': 'application/json'
                });
            });
        });
    });
});
