import { INodeProperties } from 'n8n-workflow';

export const retrieveFields: INodeProperties[] = [
	// TODO:
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [],
		displayOptions: {
			show: {
				mode: ['retrieve'],
			},
		},
	},
];
