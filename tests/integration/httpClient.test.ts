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

	test('sending custom headers', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		Orion.setHeader('x-custom-header', 'header value');
		Orion.setHeaders({
			'x-custom-header-2': 'header value 2',
		});

		await Orion.makeHttpClient().request('/posts', HttpMethod.GET);

		const requests = server.pretender.handledRequests;
		expect(requests[0].requestHeaders['x-custom-header']).toStrictEqual('header value');
		expect(requests[0].requestHeaders['x-custom-header-2']).toStrictEqual('header value 2');
	});
});
