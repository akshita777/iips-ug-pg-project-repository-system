import { portal } from '$lib/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	faculty: portal.summaries(),
	departments: portal.departments
});
