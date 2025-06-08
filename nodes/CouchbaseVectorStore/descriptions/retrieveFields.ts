import { INodeProperties } from 'n8n-workflow';

export const retrieveFields: INodeProperties[] = [
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
				mode: ['retrieve'],
			},
		},
	},
];
