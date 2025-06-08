import { Embeddings } from '@langchain/core/embeddings';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getVectorStoreClient } from '../getVectorStoreClient';
import { getMetadataFiltersValues } from '../shared/getMetadataFiltersValues';

export async function handleLoadOperation(
	context: IExecuteFunctions,
	embeddings: Embeddings,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	const filter = getMetadataFiltersValues(context, itemIndex);
	const vectorStore = await getVectorStoreClient(context, embeddings, itemIndex);
	const prompt = context.getNodeParameter('prompt', itemIndex) as string;
	const topK = context.getNodeParameter('topK', itemIndex, 4) as number;
	const includeDocumentMetadata = context.getNodeParameter(
		'includeDocumentMetadata',
		itemIndex,
		true,
	) as boolean;
	const embeddedPrompt = await embeddings.embedQuery(prompt);
	const docs = await vectorStore.similaritySearchVectorWithScore(embeddedPrompt, topK, filter);
	const serializedDocs = docs.map(([doc, score]) => {
		const document = {
			pageContent: doc.pageContent,
			...(includeDocumentMetadata ? { metadata: doc.metadata } : {}),
		};
		return {
			json: { document, score },
			pairedItem: {
				item: itemIndex,
			},
		};
	});

	return serializedDocs;
}
