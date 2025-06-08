import type { INodeProperties } from 'n8n-workflow';

export const retrieveAsToolFields: INodeProperties[] = [
	{
		displayName: 'Description',
		name: 'toolDescription',
		type: 'string',
		default: '',
		required: true,
		typeOptions: { rows: 2 },
		description:
			'Explain to the LLM what this tool does, a good, specific description would allow LLMs to produce expected results much more often',
		placeholder: `e.g. Work with your data in Supabase Vector Store`,
		displayOptions: {
			show: {
				mode: ['retrieve-as-tool'],
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
				mode: ['retrieve-as-tool'],
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
				mode: ['retrieve-as-tool'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [],
		displayOptions: {
			show: {
				mode: ['retrieve-as-tool'],
			},
		},
	},
];
