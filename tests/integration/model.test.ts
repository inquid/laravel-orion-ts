import makeServer from './drivers/default/server';
import Post from '../stubs/models/post';

let server: any;

beforeEach(() => {
	server = makeServer();
});

afterEach(() => {
	server.shutdown();
});

describe('Model tests', () => {
	test('saving a model', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		const post = await Post.$query().find(1);

		post.$attributes.title = 'Updated Post';
		await post.$save();

		expect(server.schema.posts.find('1').attrs.title).toBe('Updated Post');
	});

	test('trashing a model', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		const post = await Post.$query().find(1);

		await post.$destroy();

		expect(server.schema.posts.find('1').attrs.deleted_at).toBeDefined();
	});

	test('force deleting a model', async () => {
		server.schema.posts.create({ title: 'Test Post' });

		const post = await Post.$query().find(1);

		await post.$destroy(true);

		expect(server.schema.posts.find('1')).toBeNull();
	});

	test('static pagination method', async () => {
		// Create 5 posts for testing pagination
		server.schema.posts.create({ title: 'Test Post A' });
		server.schema.posts.create({ title: 'Test Post B' });
		server.schema.posts.create({ title: 'Test Post C' });
		server.schema.posts.create({ title: 'Test Post D' });
		server.schema.posts.create({ title: 'Test Post E' });

		const result = await Post.$paginate(2, 1);

		expect(result.items).toHaveLength(2);
		expect(result.items[0]).toBeInstanceOf(Post);
		expect(result.items[1]).toBeInstanceOf(Post);
		expect(result.meta.total).toBe(5);
		expect(result.meta.per_page).toBe(2);
		expect(result.meta.current_page).toBe(1);
		expect(result.meta.prev_page_url).toBeNull();
		expect(result.meta.next_page_url).toBe('https://api-mock.test/api/posts/paginate?page=2&limit=2');
	});
});
