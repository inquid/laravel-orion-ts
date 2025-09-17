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

	test('using custom headers with setHeader', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		Orion.clearHeaders();
		Orion.setHeader('X-Custom-Header', 'test-value');
		Orion.setHeader('X-Another-Header', 'another-value');
		
		await Orion.makeHttpClient().request('/posts', HttpMethod.GET);

		const requests = server.pretender.handledRequests;
		expect(requests[0].requestHeaders['X-Custom-Header']).toStrictEqual('test-value');
		expect(requests[0].requestHeaders['X-Another-Header']).toStrictEqual('another-value');
	});

	test('using custom headers with setHeaders', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		Orion.clearHeaders();
		Orion.setHeaders({
			'X-Custom-Header': 'test-value',
			'X-Another-Header': 'another-value'
		});
		
		await Orion.makeHttpClient().request('/posts', HttpMethod.GET);

		const requests = server.pretender.handledRequests;
		expect(requests[0].requestHeaders['X-Custom-Header']).toStrictEqual('test-value');
		expect(requests[0].requestHeaders['X-Another-Header']).toStrictEqual('another-value');
	});

	test('combining bearer token with custom headers', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		Orion.clearHeaders();
		Orion.setToken('test-token');
		Orion.setHeader('X-Custom-Header', 'custom-value');
		
		await Orion.makeHttpClient().request('/posts', HttpMethod.GET);

		const requests = server.pretender.handledRequests;
		expect(requests[0].requestHeaders['Authorization']).toStrictEqual('Bearer test-token');
		expect(requests[0].requestHeaders['X-Custom-Header']).toStrictEqual('custom-value');
	});

	test('clearing headers removes them from requests', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		Orion.setHeaders({
			'X-Custom-Header': 'test-value',
			'X-Another-Header': 'another-value'
		});
		Orion.clearHeaders();
		
		await Orion.makeHttpClient().request('/posts', HttpMethod.GET);

		const requests = server.pretender.handledRequests;
		expect(requests[0].requestHeaders['X-Custom-Header']).toBeUndefined();
		expect(requests[0].requestHeaders['X-Another-Header']).toBeUndefined();
	});
});
