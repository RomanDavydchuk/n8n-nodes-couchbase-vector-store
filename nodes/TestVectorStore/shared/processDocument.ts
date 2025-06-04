import type { Document } from '@langchain/core/documents';
import type { INodeExecutionData } from 'n8n-workflow';

export async function processDocument(
	documentInput: any, // TODO: types
	inputItem: INodeExecutionData,
	itemIndex: number,
) {
	let processedDocuments: Document[];

	if (Array.isArray(documentInput)) {
		processedDocuments = documentInput;
	} else {
		processedDocuments = await documentInput.processItem(inputItem, itemIndex);
	}

	const serializedDocuments = processedDocuments.map(({ metadata, pageContent }) => ({
		json: { metadata, pageContent },
		pairedItem: {
			item: itemIndex,
		},
	}));

	return {
		processedDocuments,
		serializedDocuments,
	};
}
