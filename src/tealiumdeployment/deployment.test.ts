import axios from 'axios';
import { deployment } from './deployment';
import { config } from '../config';
import winston from 'winston';
import { DeploymentConfiguration } from './TealiumDeploymentPipeline';
import { Occurrence, Scope, Status } from './TealiumAPI';
import * as fs from 'fs';

jest.mock('fs');

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
                data: { account: 'tealium-account', profile: 'test-solutions2', extensions: [{
                    id: 4,
                    extensionId: 100036,
                    name: 'My extension',
                    status: 'active',
                    extensionType: 'Javascript Code',
                    scope: 'After Load Rules',
                    occurrence: 'Run Always',
                    notes: 'extension notes here',
                    loadRule: null,
                    library: null,
                    selectedTargets: { qa: true, prod: true, dev: true },
                    environmentVersions: null,
                    conditions: [],
                    configuration: { code: 'b.page_name ||= "Generic Page";' }
                }] },
                message: 'Ok'
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

describe('deployment', () => {

    beforeEach(() => {
        config.tealium.account = 'tealium-account';
        config.tealium.user = 'fake-user';
        config.tealium.apiKey = 'fake-api-key';

        mockedAxios.get.mockClear();
        mockedAxios.post.mockClear();
        mockedAxios.patch.mockClear();
    });

    it('Profile not found', async () => {
        expect(async () => {
            const logger = winston.createLogger();
            const testDeployment = { profile: 'test-profile', extensions: [] };
            await deployment(testDeployment.profile, testDeployment, 'test-commit', logger);
        }).rejects.toThrow('Unknown Profile test-profile');
    });

    it('Takes login credentials from config', async () => {
        const logger = winston.createLogger();
        const testDeployment = { profile: 'test-solutions2', extensions: [] };
        simulateConnectionSucessful();
        simulateGetProfileSucessful();
        await deployment(testDeployment.profile, testDeployment, 'test-commit', logger);
        // Verify axios.post was called
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);

        // Get the call arguments
        const callArgs = mockedAxios.post.mock.calls[0];
        const url = callArgs?.[0];
        const body = callArgs?.[1] as URLSearchParams;

        // Verify URL
        expect(url).toBe('https://platform.tealiumapis.com/v3/auth/accounts/tealium-account/profiles/test-solutions2');

        // Verify body contains correct parameters
        expect(body).toBeInstanceOf(URLSearchParams);
        expect(body.get('username')).toBe('fake-user');
        expect(body.get('key')).toBe('fake-api-key');
    });

    it('deployes javascript extension', async () => {
        const mockedFileReadSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;
        mockedFileReadSync.mockReturnValue('(() => {const a = window.utag.getconst(); a += 1; console.log(a+""); })();');
        const logger = winston.createLogger();
        const testDeployment: DeploymentConfiguration = { profile: 'test-solutions2', extensions: [
            {
                name: 'My new extension',
                id: 4,
                file: './testfile/testcode.js',
                scope: Scope.AfterLoadRules,
                occurrence: Occurrence.RunOnce,
                status: Status.Inactive,
                useMinify: true
            }
        ] };
        simulateConnectionSucessful();
        simulateGetProfileInternalError();
        simulateGetProfileSucessful();
        simulatePatchSuccessful();
        await deployment(testDeployment.profile, testDeployment, 'test-commit', logger);

        const callArgs = mockedAxios.patch.mock.calls[0];
        const url = callArgs?.[0];
        const body = callArgs?.[1] as any;

        expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
        expect(url).toBe('https://test.tealium.com/v3/tiq/accounts/tealium-account/profiles/test-solutions2');
        expect(body.notes).toBe('GITHUB/CICD test-commit');
        expect(body.saveType).toBe('saveAs');
        expect(body.operationList.length).toBe(1);
        const operation = body.operationList[0];

        expect(operation.op).toBe('replace');
        expect(operation.path).toBe('/extensions/4');
        expect(operation.value.conditions).toStrictEqual([[]]);
        expect(operation.value.configuration).toStrictEqual([{
            name: 'code',
            value: '(()=>{const a=window.utag.getconst();a+=1,console.log(a+\"\")})();'
        }]);
        expect(operation.value.name).toBe('[A] My new extension');
        expect(operation.value.occurrence).toBe('Run Once');
        expect(operation.value.scope).toBe('After Load Rules');
        expect(operation.value.status).toBe('inactive');
        expect(operation.value.type).toBe('Javascript Code');

        const notes = operation.value.notes;
        expect(notes.includes('⚠️ DEPLOYED BY GITHUB-CI/CD - DO NOT CHANGE MANUALLY ⚠️')).toBe(true);
        expect(notes.includes('Commit: test-commit')).toBe(true);
        expect(notes.includes('Src: ./testfile/testcode.js')).toBe(true);
        expect(notes.includes('Deployed at:')).toBe(true);
        expect(notes.includes('Hash:')).toBe(true);
    });

    it('throws if login failed', async () => {
        const logger = winston.createLogger();
        const testDeployment = { profile: 'test-solutions2', extensions: [] };
        simulateConntectionUnauthorized();
        expect(async () => await deployment(testDeployment.profile, testDeployment, 'test-commit', logger))
            .rejects.toThrow('Tealium login failed');
    });

    it('Get Profile failed', async () => {
        const logger = winston.createLogger();
        const testDeployment = { profile: 'test-solutions2', extensions: [] };
        simulateConnectionSucessful();
        simulateGetProfileInternalError();
        expect(async () => await deployment(testDeployment.profile, testDeployment, 'test-commit', logger))
            .rejects.toThrow('GetProfile failed. Internal Error');
    });
});

describe('test', () => {
    it('test', () => { expect(1).toBe(1); });
});
