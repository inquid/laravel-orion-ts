import { Orion } from '../../src/orion';
import { AuthDriver } from '../../src/drivers/default/enums/authDriver';
import axios from 'axios';

describe('Orion tests', () => {
	beforeEach(() => {
		Orion.clearHeaders();
		Orion.withoutToken();
	});

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

	test('setting single custom header', () => {
		Orion.setHeader('x-custom-header', 'header value');

		expect(Orion.getCustomHeaders()).toEqual({
			'x-custom-header': 'header value'
		});
	});

	test('setting multiple custom headers', () => {
		Orion.setHeaders({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2'
		});

		expect(Orion.getCustomHeaders()).toEqual({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2'
		});
	});

	test('merging custom headers with existing ones', () => {
		Orion.setHeader('x-custom-header', 'header value');
		Orion.setHeaders({
			'x-custom-header2': 'header value2',
			'x-custom-header3': 'header value3'
		});

		expect(Orion.getCustomHeaders()).toEqual({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2',
			'x-custom-header3': 'header value3'
		});
	});

	test('overwriting existing header with setHeader', () => {
		Orion.setHeader('x-custom-header', 'original value');
		Orion.setHeader('x-custom-header', 'new value');

		expect(Orion.getCustomHeaders()).toEqual({
			'x-custom-header': 'new value'
		});
	});

	test('overwriting existing header with setHeaders', () => {
		Orion.setHeader('x-custom-header', 'original value');
		Orion.setHeaders({
			'x-custom-header': 'new value',
			'x-custom-header2': 'another value'
		});

		expect(Orion.getCustomHeaders()).toEqual({
			'x-custom-header': 'new value',
			'x-custom-header2': 'another value'
		});
	});

	test('clearing all custom headers', () => {
		Orion.setHeaders({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2'
		});
		Orion.clearHeaders();

		expect(Orion.getCustomHeaders()).toEqual({});
	});

	test('custom headers are included in http client config', () => {
		Orion.setHeaders({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2'
		});

		const config = Orion.getHttpClientConfig();
		expect(config.headers).toEqual({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2'
		});
	});

	test('custom headers work with authorization token', () => {
		Orion.setToken('test-token');
		Orion.setHeaders({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2'
		});

		const config = Orion.getHttpClientConfig();
		expect(config.headers).toEqual({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2',
			'Authorization': 'Bearer test-token'
		});
	});

	test('chaining methods works correctly', () => {
		const result = Orion
			.setHeader('x-custom-header', 'header value');

		Orion.setToken('test-token');

		Orion.setHeaders({
			'x-custom-header2': 'header value2'
		});

		expect(result).toBe(Orion);
		expect(Orion.getCustomHeaders()).toEqual({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2'
		});
		expect(Orion.getToken()).toBe('test-token');
	});
});
