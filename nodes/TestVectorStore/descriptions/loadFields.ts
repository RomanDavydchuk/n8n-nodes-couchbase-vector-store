import { INodeProperties } from 'n8n-workflow';

export const loadFields: INodeProperties[] = [
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		default: '',
		required: true,
		description:
			'Search prompt to retrieve matching documents from the vector store using similarity-based ranking',
		displayOptions: {
			show: {
				mode: ['load'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'topK',
		type: 'number',
		default: 4,
		description: 'Number of top results to fetch from vector store',
		displayOptions: {
			show: {
				mode: ['load'],
			},
		},
	},
	{
		displayName: 'Include Metadata',
		name: 'includeDocumentMetadata',
		type: 'boolean',
		default: true,
		description: 'Whether or not to include document metadata',
		displayOptions: {
			show: {
				mode: ['load'],
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
			{
				displayName: 'Metadata Filter',
				name: 'metadata',
				type: 'fixedCollection',
				description: 'Metadata to filter the document by',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add filter field',
				options: [
					{
						name: 'metadataValues',
						displayName: 'Fields to Set',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
		],
		displayOptions: {
			show: {
				mode: ['load'],
			},
		},
	},
];
