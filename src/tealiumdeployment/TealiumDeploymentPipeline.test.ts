import { TealiumDeploymentPipeline } from './TealiumDeploymentPipeline';
import { TealiumAPI } from './TealiumAPI';
import { config } from '../config';
import winston from 'winston';

jest.mock('./TealiumAPI', () => {
    const actual = jest.requireActual('./TealiumAPI');
    return {
        ...actual,
        TealiumAPI: jest.fn()
    };
});

const mockTealiumAPI = (...methods: Partial<TealiumAPI>[]) => {
    const combinedMocks = Object.assign({}, ...methods);
    (TealiumAPI as jest.MockedClass<typeof TealiumAPI>).mockImplementation(() => combinedMocks);
    return combinedMocks;
};

const simulateConnectFailed = () => {
    const mockConnect = jest.fn().mockRejectedValue(new Error('Auth failed. Unauthorized'));
    return { connect: mockConnect };
};

const simulateConnectSuccess = () => {
    const mockConnect = jest.fn().mockResolvedValue(true);
    return { connect: mockConnect };
};

const simulateConnectError = () => {
    const mockConnect = jest.fn().mockRejectedValue(new Error('Network error'));
    return { connect: mockConnect };
};

const simulateGetProfileSuccess = (mockProfile: any) => {
    const mockGetProfile = jest.fn().mockResolvedValue(mockProfile);
    return { getProfile: mockGetProfile };
};

const simulateGetProfileError = (error: Error) => {
    const mockGetProfile = jest.fn().mockRejectedValue(error);
    return { getProfile: mockGetProfile };
};

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ]
});

describe('TealiumDeploymentPipeline', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        config.tealium.account = 'test-account';
        config.tealium.user = 'test-user';
        config.tealium.apiKey = 'test-key';
    });

    it('throws error for unknown profile', () => {
        expect(() => {
            // eslint-disable-next-line no-new
            new TealiumDeploymentPipeline({ profile: 'unknown-profile' }, logger);
        }).toThrow('Unknown Profile unknown-profile');
    });

    it('accepts valid profile', () => {
        const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
        expect(pipeline).toBeDefined();
    });

    describe('connect', () => {
        it('connects successfully', async () => {
            const mocked = mockTealiumAPI(
                simulateConnectSuccess()
            );

            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
            await pipeline.connect();

            expect(TealiumAPI).toHaveBeenCalledWith('test-user', 'test-key');
            expect(mocked.connect).toHaveBeenCalledWith('test-account', 'test-solutions2');
        });

        it('throws "Login failed" on Unauthorized', async () => {
            mockTealiumAPI(
                simulateConnectFailed()
            );
            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);

            await expect(pipeline.connect()).rejects.toThrow('Tealium login failed');
        });

        it('rethrows other errors', async () => {
            mockTealiumAPI(
                simulateConnectError()
            );
            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);

            await expect(pipeline.connect()).rejects.toThrow('Network error');
        });
    });

    describe('fetchProfile', () => {
        it('throws error when not connected', async () => {
            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);

            await expect(pipeline.fetchProfile()).rejects.toThrow('Not connected');
        });

        it('throws error when not account not matching profile account', async () => {
            const mockProfile = { account: 'another-account', profile: 'test-profile', extensions: [], version: 123 };
            mockTealiumAPI(
                simulateConnectSuccess(),
                simulateGetProfileSuccess(mockProfile)
            );
            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
            await pipeline.connect();
            await expect(pipeline.fetchProfile()).rejects.toThrow('Failed loading Profile');
        });

        it('throws error when not account not matching profile account', async () => {
            const mockProfile = { account: 'test-account', profile: 'another-profile', extensions: [], version: 123 };
            mockTealiumAPI(
                simulateConnectSuccess(),
                simulateGetProfileSuccess(mockProfile)
            );
            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
            await pipeline.connect();
            await expect(pipeline.fetchProfile()).rejects.toThrow('Failed loading Profile');
        });

        it('throws error when not profile undefined', async () => {
            mockTealiumAPI(
                simulateConnectSuccess(),
                simulateGetProfileSuccess(undefined)
            );
            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
            await pipeline.connect();
            await expect(pipeline.fetchProfile()).rejects.toThrow('Failed loading Profile');
        });

        it('throws error when getProfile fails', async () => {
            mockTealiumAPI(
                simulateConnectSuccess(),
                simulateGetProfileError(new Error('Internal Error'))
            );

            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
            await pipeline.connect();

            await expect(pipeline.fetchProfile()).rejects.toThrow('Internal Error');
        });

        it('fetches profile successfully', async () => {
            const mockProfile = { account: 'test-account', profile: 'test-solutions2', extensions: [], version: 123 };
            const mocked = mockTealiumAPI(
                simulateConnectSuccess(),
                simulateGetProfileSuccess(mockProfile)
            );

            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
            await pipeline.connect();
            const result = await pipeline.fetchProfile();

            expect(mocked.getProfile).toHaveBeenCalled();
            expect(result).toEqual(mockProfile);
        });
    });

    describe('getRemoteExtensions', () => {
        it('throws if current profile not loaded', () => {
            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
            expect(() => {
                pipeline.getRemoteExtensions();
            }).toThrow('Profile not loaded. Run fetchProfile first.');
        });

        it('returns empty array if profile has no extensions', async () => {
            const mockProfile = { account: 'test-account', profile: 'test-solutions2', extensions: null, version: 123 };
            mockTealiumAPI(
                simulateConnectSuccess(),
                simulateGetProfileSuccess(mockProfile)
            );
            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
            await pipeline.connect();
            await pipeline.fetchProfile();
            expect(pipeline.getRemoteExtensions()).toEqual([]);
        });

        it('returns extensions object array', async () => {
            const extensions = [{
                id: 123,
                name: 'test-extension',
                notes: 'test',
                extensionType: 'Javascript Code',
                occurrence: 'Run Always',
                scope: 'After Load Rules',
                status: 'active',
                configuration: { code: 'console.log("Hello!");' } }];
            const mockProfile = { account: 'test-account', profile: 'test-solutions2', extensions: extensions, version: 123 };
            mockTealiumAPI(
                simulateConnectSuccess(),
                simulateGetProfileSuccess(mockProfile)
            );
            const pipeline = new TealiumDeploymentPipeline({ profile: 'test-solutions2' }, logger);
            await pipeline.connect();
            await pipeline.fetchProfile();
            expect(pipeline.getRemoteExtensions()).toEqual([{
                'code': 'console.log("Hello!");',
                filepath: '',
                id: 123,
                notes: 'test',
                occurrence: 'Run Always',
                scope: 'After Load Rules',
                status: 'active',
                name: 'test-extension',
                type: 'Javascript Code'
            }]);
        });
    });
});
