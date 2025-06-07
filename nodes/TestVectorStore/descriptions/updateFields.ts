import { INodeProperties } from 'n8n-workflow';

export const updateFields: INodeProperties[] = [
	{
		displayName: 'ID',
		name: 'id',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of an embedding entry',
		displayOptions: {
			show: {
				mode: ['update'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Query Name',
				name: 'queryName',
				type: 'string',
				default: 'match_documents',
				description: 'Name of the query to use for matching documents',
			},
		],
		displayOptions: {
			show: {
				mode: ['update'],
			},
		},
	},
];
