import { belongsTo, createServer, hasMany, Model as MirageModel } from 'miragejs';
import { Orion } from '../../../../src/orion';
import { LaravelSerializer } from './serializer';

export default function makeServer() {
	return createServer({
		environment: 'test',

		trackRequests: true,

		serializers: {
			application: LaravelSerializer,
		},

		models: {
			post: MirageModel.extend({
				user: belongsTo('user'),
			}),
			user: MirageModel.extend({
				posts: hasMany('posts'),
			}),
		},

		routes: function () {
			this.urlPrefix = 'https://api-mock.test';
			this.namespace = '';

			this.get('/sanctum/csrf-cookie', () => {
				const cookieExpiration = new Date(new Date().getTime() + 24 * 3600 * 1000);
				document.cookie = `XSRF-TOKEN=test; path=/; expires=${cookieExpiration.toUTCString()};`;

				return [];
			});

			this.get('/api/posts', function (schema: any, request) {
				const limit = parseInt(String(request.queryParams.limit || '15')) || 15;
				const page = parseInt(String(request.queryParams.page || '1')) || 1;
				const offset = (page - 1) * limit;
				
				const posts = schema.posts.all();
				const total = posts.length;
				const paginatedPosts = posts.slice(offset, offset + limit);
				
				// Check if this is a pagination request (has limit and page params)
				// Only return pagination format when explicitly requested via the paginate method
				const isPaginationRequest = false; // For now, always return old format for get() method
				
				if (isPaginationRequest) {
					const totalPages = Math.ceil(total / limit);
					const baseUrl = 'https://api-mock.test/api/posts';
					
					return {
						data: paginatedPosts.models,
						meta: {
							total,
							per_page: limit,
							current_page: page,
							prev_page_url: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
							next_page_url: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null
						}
					};
				} else {
					// Return the original format for backward compatibility
					return { data: paginatedPosts.models };
				}
			});

			this.post('/api/posts', function (schema: any, request) {
				const attrs = JSON.parse(request.requestBody);

				return schema.posts.create(attrs);
			});

			this.post('/api/posts/search', function (schema: any, request) {
				const limit = parseInt(String(request.queryParams.limit || '15')) || 15;
				const page = parseInt(String(request.queryParams.page || '1')) || 1;
				const offset = (page - 1) * limit;
				
				const posts = schema.posts.all();
				const total = posts.length;
				const paginatedPosts = posts.slice(offset, offset + limit);
				
				// Check if this is a pagination request (has limit and page params)
				// Only return pagination format when explicitly requested via the paginate method
				const isPaginationRequest = false; // For now, always return old format for search() method
				
				if (isPaginationRequest) {
					const totalPages = Math.ceil(total / limit);
					const baseUrl = 'https://api-mock.test/api/posts/search';
					
					return {
						data: paginatedPosts.models,
						meta: {
							total,
							per_page: limit,
							current_page: page,
							prev_page_url: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
							next_page_url: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null
						}
					};
				} else {
					// Return the original format for backward compatibility
					return { data: paginatedPosts.models };
				}
			});

			// Pagination endpoints
			this.get('/api/posts/paginate', function (schema: any, request) {
				const limit = parseInt(String(request.queryParams.limit || '15')) || 15;
				const page = parseInt(String(request.queryParams.page || '1')) || 1;
				const offset = (page - 1) * limit;
				
				const posts = schema.posts.all();
				const total = posts.length;
				const paginatedPosts = posts.slice(offset, offset + limit);
				
				const totalPages = Math.ceil(total / limit);
				const baseUrl = 'https://api-mock.test/api/posts/paginate';
				
				return {
					data: paginatedPosts.models,
					meta: {
						total,
						per_page: limit,
						current_page: page,
						prev_page_url: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
						next_page_url: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null
					}
				};
			});

			this.post('/api/posts/search/paginate', function (schema: any, request) {
				const limit = parseInt(String(request.queryParams.limit || '15')) || 15;
				const page = parseInt(String(request.queryParams.page || '1')) || 1;
				const offset = (page - 1) * limit;
				
				const posts = schema.posts.all();
				const total = posts.length;
				const paginatedPosts = posts.slice(offset, offset + limit);
				
				const totalPages = Math.ceil(total / limit);
				const baseUrl = 'https://api-mock.test/api/posts/search/paginate';
				
				return {
					data: paginatedPosts.models,
					meta: {
						total,
						per_page: limit,
						current_page: page,
						prev_page_url: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
						next_page_url: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null
					}
				};
			});

			this.get('/api/posts/:id');
			this.patch('/api/posts/:id', (schema: any, request) => {
				const id = request.params.id;
				const attrs = JSON.parse(request.requestBody);

				const post = schema.posts.find(id);

				return post.update(attrs);
			});

			this.del('/api/posts/:id', (schema: any, request) => {
				const id = request.params.id;
				const post = schema.posts.find(id);

				if (request.queryParams.force === 'true') {
					post.destroy();
				} else {
					post.update({ deleted_at: '2021-01-01' });
				}

				return post;
			});

			this.post('/api/posts/:id/restore', (schema: any, request) => {
				const id = request.params.id;
				const post = schema.posts.find(id);

				return post.update({ deleted_at: null });
			});

			this.post('/api/users/:id/posts/associate', (schema: any, request) => {
				const userId = request.params.id;
				const postId = JSON.parse(request.requestBody).related_key;
				const post = schema.posts.find(postId);

				return post.update({ user_id: userId });
			});

			this.delete('/api/users/:user_id/posts/:post_id/dissociate', (schema: any, request) => {
				const postId = request.params.post_id;
				const post = schema.posts.find(postId);

				return post.update({ user_id: null });
			});

			this.post('/api/posts/:id/tags/attach', (schema: any, request) => {
				const tagIds = JSON.parse(request.requestBody).resources;

				return {
					attached: Array.isArray(tagIds) ? tagIds : Object.keys(tagIds),
				};
			});

			this.delete('/api/posts/:id/tags/detach', (schema: any, request) => {
				const tagIds = JSON.parse(request.requestBody).resources;

				return {
					detached: Array.isArray(tagIds) ? tagIds : Object.keys(tagIds),
				};
			});

			this.patch('/api/posts/:id/tags/sync', (schema: any, request) => {
				const tagIds = JSON.parse(request.requestBody).resources;

				return {
					attached: Array.isArray(tagIds) ? tagIds : Object.keys(tagIds),
					updated: Array.isArray(tagIds) ? tagIds : Object.keys(tagIds),
					detached: Array.isArray(tagIds) ? tagIds : Object.keys(tagIds),
				};
			});

			this.patch('/api/posts/:id/tags/toggle', (schema: any, request) => {
				const tagIds = JSON.parse(request.requestBody).resources;

				return {
					attached: Array.isArray(tagIds) ? tagIds : Object.keys(tagIds),
					detached: Array.isArray(tagIds) ? tagIds : Object.keys(tagIds),
				};
			});

			this.patch('/api/posts/:post_id/tags/:tag_id/pivot', (schema: any, request) => {
				return {
					updated: [request.params.tag_id],
				};
			});

			this.post('/api/posts/batch', (schema: any, request) => {
				const body: {
					resources: any[]
				} = JSON.parse(request.requestBody);

				const rval: any[] = [];
				for (let i = 0; i < body.resources.length; i++) {
					rval.push(schema.posts.create(body.resources[i]));
				}

				return {data: rval};
			})

			this.patch('/api/posts/batch', (schema: any, request) => {
				const body: {
					resources: Record<string, unknown>
				} = JSON.parse(request.requestBody);

				const rval: any[] = [];
				for (const key in body.resources) {
					const attrs = body.resources[key];

					const post = schema.posts.find(key);


					rval.push(post.update(attrs));
				}

				return {data: rval};
			})

			this.delete('/api/posts/batch', (schema: any, request) => {
				const body: {
					resources: number[]
				} = JSON.parse(request.requestBody);

				const rval: any[] = [];
				for (let i = 0; i < body.resources.length; i++) {
					const id = body.resources[i];
					const post = schema.posts.find(id);

					post.update({ deleted_at: '2021-01-01' });

					rval.push(post);
				}

				return {data: rval};
			})

			this.post('/api/posts/batch/restore', (schema: any, request) => {
				const body: {
					resources: number[]
				} = JSON.parse(request.requestBody);

				const rval: any[] = [];

				for (let i = 0; i < body.resources.length; i++) {
					const id = body.resources[i];
					const post = schema.posts.find(id);

					post.update({ deleted_at: null });

					rval.push(post);
				}

				return {data: rval};
			})
		},
	});
}

Orion.init('https://api-mock.test');
