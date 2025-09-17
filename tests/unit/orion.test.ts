import { Orion } from '../../src/orion';
import { AuthDriver } from '../../src/drivers/default/enums/authDriver';
import axios from 'axios';

describe('Orion tests', () => {
	test('initialization', () => {
		Orion.init('https://example.com', 'custom-prefix', AuthDriver.Passport, 'test-token');

		expect(Orion.getBaseUrl()).toBe('https://example.com/');
		expect(Orion.getPrefix()).toBe('custom-prefix');
		expect(Orion.getAuthDriver()).toBe(AuthDriver.Passport);
		expect(Orion.getToken()).toBe('test-token');
	});

	test('getting and setting host', () => {
		Orion.setBaseUrl('https://example.com/');

		expect(Orion.getBaseUrl()).toBe('https://example.com/');
	});

	test('getting and setting prefix', () => {
		Orion.setPrefix('api');

		expect(Orion.getPrefix()).toBe('api');
	});

	test('getting api url', () => {
		Orion.setBaseUrl('https://example.com/');
		Orion.setPrefix('api');

		expect(Orion.getApiUrl()).toBe('https://example.com/api');
	});

	test('getting and setting token', () => {
		Orion.setToken('test');

		expect(Orion.getToken()).toBe('test');
	});

	test('unsetting token', () => {
		Orion.setToken('test');
		Orion.withoutToken();

		expect(Orion.getToken()).toBeNull();
	});

	test('appending slash to the end when getting api url', () => {
		Orion.setBaseUrl('https://example.com/api');

		expect(Orion.getBaseUrl()).toBe('https://example.com/api/');
	});

	test('making http client using user-provided callback', () => {
		Orion.init('https://example.com', 'custom-prefix', AuthDriver.Passport, 'test-token');
		Orion.makeHttpClientUsing(() => {
			const client = axios.create();

			client.defaults.baseURL = 'https://custom.com';

			return client;
		});

		expect(Orion.makeHttpClient().getAxios().defaults.baseURL).toBe('https://custom.com');
	});

	describe('header management', () => {
		beforeEach(() => {
			Orion.clearHeaders();
			Orion.withoutToken();
		});

		test('setting a single header', () => {
			Orion.setHeader('x-custom-header', 'header value');

			const headers = Orion.getHeaders();
			expect(headers['x-custom-header']).toBe('header value');
		});

		test('setting multiple headers at once', () => {
			Orion.setHeaders({
				'x-custom-header': 'header value',
				'x-custom-header2': 'header value2',
			});

			const headers = Orion.getHeaders();
			expect(headers['x-custom-header']).toBe('header value');
			expect(headers['x-custom-header2']).toBe('header value2');
		});

		test('setHeaders merges with existing headers', () => {
			Orion.setHeader('x-existing-header', 'existing value');
			Orion.setHeaders({
				'x-custom-header': 'header value',
				'x-custom-header2': 'header value2',
			});

			const headers = Orion.getHeaders();
			expect(headers['x-existing-header']).toBe('existing value');
			expect(headers['x-custom-header']).toBe('header value');
			expect(headers['x-custom-header2']).toBe('header value2');
		});

		test('setHeaders overwrites existing headers with same name', () => {
			Orion.setHeader('x-custom-header', 'original value');
			Orion.setHeaders({
				'x-custom-header': 'new value',
			});

			const headers = Orion.getHeaders();
			expect(headers['x-custom-header']).toBe('new value');
		});

		test('getting headers returns a copy', () => {
			Orion.setHeader('x-custom-header', 'header value');
			
			const headers = Orion.getHeaders();
			headers['x-modified'] = 'modified value';

			const originalHeaders = Orion.getHeaders();
			expect(originalHeaders['x-modified']).toBeUndefined();
		});

		test('removing a specific header', () => {
			Orion.setHeaders({
				'x-custom-header': 'header value',
				'x-custom-header2': 'header value2',
			});

			Orion.removeHeader('x-custom-header');

			const headers = Orion.getHeaders();
			expect(headers['x-custom-header']).toBeUndefined();
			expect(headers['x-custom-header2']).toBe('header value2');
		});

		test('clearing all headers', () => {
			Orion.setHeaders({
				'x-custom-header': 'header value',
				'x-custom-header2': 'header value2',
			});

			Orion.clearHeaders();

			const headers = Orion.getHeaders();
			expect(Object.keys(headers)).toHaveLength(0);
		});

		test('custom headers are included in http client config', () => {
			Orion.init('https://example.com');
			Orion.setHeaders({
				'x-custom-header': 'header value',
				'x-custom-header2': 'header value2',
			});

			const config = Orion.getHttpClientConfig();
			expect(config.headers?.['x-custom-header']).toBe('header value');
			expect(config.headers?.['x-custom-header2']).toBe('header value2');
		});

		test('custom headers work together with auth token', () => {
			Orion.init('https://example.com', 'api', AuthDriver.Default, 'test-token');
			Orion.setHeader('x-custom-header', 'header value');

			const config = Orion.getHttpClientConfig();
			expect(config.headers?.['Authorization']).toBe('Bearer test-token');
			expect(config.headers?.['x-custom-header']).toBe('header value');
		});

		test('auth token takes precedence over custom Authorization header', () => {
			Orion.init('https://example.com', 'api', AuthDriver.Default, 'test-token');
			Orion.setHeader('Authorization', 'Custom auth');

			const config = Orion.getHttpClientConfig();
			expect(config.headers?.['Authorization']).toBe('Bearer test-token');
		});

		test('method chaining works for header methods', () => {
			const result1 = Orion.setHeader('x-header1', 'value1');
			const result2 = Orion.setHeaders({ 'x-header2': 'value2' });
			const result3 = Orion.removeHeader('x-header1');
			const result4 = Orion.clearHeaders();

			expect(result1).toBe(Orion);
			expect(result2).toBe(Orion);
			expect(result3).toBe(Orion);
			expect(result4).toBe(Orion);
			expect(Object.keys(Orion.getHeaders())).toHaveLength(0);
		});

		test('http client config is rebuilt when headers change', () => {
			Orion.init('https://example.com');
			
			const configBefore = Orion.getHttpClientConfig();
			Orion.setHeader('x-custom-header', 'header value');
			const configAfter = Orion.getHttpClientConfig();

			expect(configBefore).not.toBe(configAfter);
			expect(configAfter.headers?.['x-custom-header']).toBe('header value');
		});
	});
});
