import { INodeProperties } from 'n8n-workflow';

export const insertFields: INodeProperties[] = [
	{
		displayName: 'Embedding Batch Size',
		name: 'embeddingBatchSize',
		type: 'number',
		default: 200,
		description: 'Number of documents to embed in a single batch',
		displayOptions: {
			show: {
				mode: ['insert'],
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
				mode: ['insert'],
			},
		},
	},
];
