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
	// TODO: Options
];
