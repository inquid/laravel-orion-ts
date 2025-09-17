import { Orion } from '../../src/orion';
import makeServer from './drivers/default/server';
import { HttpMethod } from '../../src/drivers/default/enums/httpMethod';

let server: any;

beforeEach(() => {
	server = makeServer();
});

afterEach(() => {
	server.shutdown();
});

describe('HttpClient tests', () => {
	test('using bearer token', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		Orion.setToken('test');
		await Orion.makeHttpClient().request('/posts', HttpMethod.GET);

		const requests = server.pretender.handledRequests;
		expect(requests[0].requestHeaders['Authorization']).toStrictEqual('Bearer test');
	});

	test('using single custom header', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		Orion.withoutToken();
		Orion.setHeaders({});
		Orion.setHeader('x-custom-header', 'header value');

		await Orion.makeHttpClient().request('/posts', HttpMethod.GET);

		const requests = server.pretender.handledRequests;
		expect(requests[0].requestHeaders['x-custom-header']).toStrictEqual('header value');
	});

	test('using multiple custom headers', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		Orion.withoutToken();
		Orion.setHeaders({
			'x-custom-header': 'header value',
			'x-custom-header2': 'header value2',
		});

		await Orion.makeHttpClient().request('/posts', HttpMethod.GET);

		const requests = server.pretender.handledRequests;
		expect(requests[0].requestHeaders['x-custom-header']).toStrictEqual('header value');
		expect(requests[0].requestHeaders['x-custom-header2']).toStrictEqual('header value2');
	});

	test('merging custom header with bearer token', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		Orion.setToken('test');
		Orion.setHeader('x-custom-header', 'header value');

		await Orion.makeHttpClient().request('/posts', HttpMethod.GET);

		const requests = server.pretender.handledRequests;
		expect(requests[0].requestHeaders['Authorization']).toStrictEqual('Bearer test');
		expect(requests[0].requestHeaders['x-custom-header']).toStrictEqual('header value');
	});
});
