import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CouchbaseApi implements ICredentialType {
	name = 'couchbaseApi';

	displayName = 'Couchbase API';

	documentationUrl = 'https://docs.couchbase.com/server/current/guides/connect.html';

	properties: INodeProperties[] = [
		{
			displayName: 'Connection String',
			name: 'connectionString',
			type: 'string',
			placeholder: 'couchbase://localhost',
			default: '',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
	];

	// TODO: `authenticate`, `test`
}
