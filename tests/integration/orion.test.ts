import { Orion } from '../../src/orion';
import { AuthDriver } from '../../src/drivers/default/enums/authDriver';
import makeServer from './drivers/default/server';

let server: any;

beforeEach(() => {
	server = makeServer();
});

afterEach(() => {
	server.shutdown();
});

describe('Orion tests', () => {
	test('retrieving csrf cookie', async () => {
		Orion.setAuthDriver(AuthDriver.Sanctum);

		await Orion.csrf();

		const requests = server.pretender.handledRequests;
		expect(requests[0].url).toBe('https://api-mock.test/sanctum/csrf-cookie');
	});

	test('attempting to fetch csrf cookie with invalid driver', async () => {
		Orion.setAuthDriver(AuthDriver.Passport);

		try {
			await Orion.csrf();
			expect(false).toBeTruthy();
		} catch (error) {
			expect((error as Error).message).toBe(
				`Current auth driver is set to "${AuthDriver.Passport}". Fetching CSRF cookie can only be used with "sanctum" driver.`
			);
		}

		const requests = server.pretender.handledRequests;
		expect(requests).toHaveLength(0);
	});

	test('custom headers are sent with requests', async () => {
		Orion.init('https://api-mock.test', 'api', AuthDriver.Default);
		Orion.clearHeaders();
		Orion.setHeaders({
			'x-custom-header': 'custom-value',
			'x-api-version': 'v2'
		});

		const httpClient = Orion.makeHttpClient();
		await httpClient.get('/test-endpoint');

		const requests = server.pretender.handledRequests;
		expect(requests).toHaveLength(1);
		expect(requests[0].requestHeaders).toMatchObject({
			'x-custom-header': 'custom-value',
			'x-api-version': 'v2'
		});
	});

	test('custom headers work with authorization token', async () => {
		Orion.init('https://api-mock.test', 'api', AuthDriver.Default, 'test-token');
		Orion.clearHeaders();
		Orion.setHeaders({
			'x-custom-header': 'custom-value',
			'x-api-version': 'v2'
		});

		const httpClient = Orion.makeHttpClient();
		await httpClient.get('/test-endpoint');

		const requests = server.pretender.handledRequests;
		expect(requests).toHaveLength(1);
		expect(requests[0].requestHeaders).toMatchObject({
			'x-custom-header': 'custom-value',
			'x-api-version': 'v2',
			'Authorization': 'Bearer test-token'
		});
	});

	test('custom headers are sent with POST requests', async () => {
		Orion.init('https://api-mock.test', 'api', AuthDriver.Default);
		Orion.clearHeaders();
		Orion.setHeader('x-custom-header', 'post-value');

		const httpClient = Orion.makeHttpClient();
		await httpClient.post('/test-endpoint', { data: 'test' });

		const requests = server.pretender.handledRequests;
		expect(requests).toHaveLength(1);
		expect(requests[0].requestHeaders).toMatchObject({
			'x-custom-header': 'post-value'
		});
	});

	test('custom headers are sent with PATCH requests', async () => {
		Orion.init('https://api-mock.test', 'api', AuthDriver.Default);
		Orion.clearHeaders();
		Orion.setHeader('x-custom-header', 'patch-value');

		const httpClient = Orion.makeHttpClient();
		await httpClient.patch('/test-endpoint', { data: 'test' });

		const requests = server.pretender.handledRequests;
		expect(requests).toHaveLength(1);
		expect(requests[0].requestHeaders).toMatchObject({
			'x-custom-header': 'patch-value'
		});
	});

	test('custom headers are sent with DELETE requests', async () => {
		Orion.init('https://api-mock.test', 'api', AuthDriver.Default);
		Orion.clearHeaders();
		Orion.setHeader('x-custom-header', 'delete-value');

		const httpClient = Orion.makeHttpClient();
		await httpClient.delete('/test-endpoint');

		const requests = server.pretender.handledRequests;
		expect(requests).toHaveLength(1);
		expect(requests[0].requestHeaders).toMatchObject({
			'x-custom-header': 'delete-value'
		});
	});
});
