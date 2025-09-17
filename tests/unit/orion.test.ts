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

	test('setting a single custom header', () => {
		Orion.clearHeaders();
		Orion.setHeader('X-Custom-Header', 'test-value');

		expect(Orion.getHeaders()).toEqual({
			'X-Custom-Header': 'test-value'
		});

		const config = Orion.getHttpClientConfig();
		expect(config.headers).toHaveProperty('X-Custom-Header', 'test-value');
	});

	test('setting multiple custom headers at once', () => {
		Orion.clearHeaders();
		Orion.setHeaders({
			'X-Custom-Header': 'test-value',
			'X-Another-Header': 'another-value'
		});

		expect(Orion.getHeaders()).toEqual({
			'X-Custom-Header': 'test-value',
			'X-Another-Header': 'another-value'
		});

		const config = Orion.getHttpClientConfig();
		expect(config.headers).toHaveProperty('X-Custom-Header', 'test-value');
		expect(config.headers).toHaveProperty('X-Another-Header', 'another-value');
	});

	test('adding headers incrementally', () => {
		Orion.clearHeaders();
		Orion.setHeader('X-First', 'first');
		Orion.setHeader('X-Second', 'second');

		expect(Orion.getHeaders()).toEqual({
			'X-First': 'first',
			'X-Second': 'second'
		});
	});

	test('overwriting existing header', () => {
		Orion.clearHeaders();
		Orion.setHeader('X-Custom', 'old-value');
		Orion.setHeader('X-Custom', 'new-value');

		expect(Orion.getHeaders()['X-Custom']).toBe('new-value');
	});

	test('clearing all custom headers', () => {
		Orion.setHeaders({
			'X-Custom-Header': 'test-value',
			'X-Another-Header': 'another-value'
		});
		Orion.clearHeaders();

		expect(Orion.getHeaders()).toEqual({});
		
		const config = Orion.getHttpClientConfig();
		expect(config.headers).not.toHaveProperty('X-Custom-Header');
		expect(config.headers).not.toHaveProperty('X-Another-Header');
	});

	test('custom headers work with authorization token', () => {
		Orion.clearHeaders();
		Orion.setToken('test-token');
		Orion.setHeader('X-Custom-Header', 'test-value');

		const config = Orion.getHttpClientConfig();
		expect(config.headers).toHaveProperty('Authorization', 'Bearer test-token');
		expect(config.headers).toHaveProperty('X-Custom-Header', 'test-value');
	});

	test('method chaining works with header methods', () => {
		Orion.clearHeaders();
		const result = Orion.setHeader('X-First', 'first').setHeaders({
			'X-Second': 'second',
			'X-Third': 'third'
		});

		expect(result).toBe(Orion);
		expect(Orion.getHeaders()).toEqual({
			'X-First': 'first',
			'X-Second': 'second',
			'X-Third': 'third'
		});
	});
});
