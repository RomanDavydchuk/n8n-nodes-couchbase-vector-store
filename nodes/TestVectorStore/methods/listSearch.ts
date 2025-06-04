import type { IDataObject, ILoadOptionsFunctions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';

export async function testTableNameSearch(this: ILoadOptionsFunctions) {
	const credentials = await this.getCredentials('testVectorStoreApi');
	const results = [];
	if (typeof credentials.host !== 'string') {
		throw new ApplicationError('Expected Supabase credentials host to be a string');
	}

	const { paths } = (await this.helpers.requestWithAuthentication.call(this, 'testVectorStoreApi', {
		headers: {
			Prefer: 'return=representation',
		},
		method: 'GET',
		uri: `${credentials.host}/rest/v1/`,
		json: true,
	})) as { paths: IDataObject };
	for (const path of Object.keys(paths)) {
		// omit introspection path
		if (path === '/') continue;

		results.push({
			name: path.replace('/', ''),
			value: path.replace('/', ''),
		});
	}

	return { results };
}
