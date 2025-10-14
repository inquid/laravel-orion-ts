export interface PaginationMeta {
	total: number;
	per_page: number;
	current_page: number;
	prev_page_url: string | null;
	next_page_url: string | null;
}

export interface PaginationResponse<T> {
	meta: PaginationMeta;
	items: T[];
}