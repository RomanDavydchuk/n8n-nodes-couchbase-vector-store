import type { ISupplyDataFunctions, SupplyData } from 'n8n-workflow';
import type { Embeddings } from '@langchain/core/embeddings';
import { DynamicTool } from 'langchain/tools';
import { getMetadataFiltersValues, nodeNameToToolName } from '../shared/helpers';
import { getVectorStoreClient } from '../core/getVectorStoreClient';
import { logWrapper } from '../shared/logWrapper';

export async function handleRetrieveAsToolOperation(
	context: ISupplyDataFunctions,
	embeddings: Embeddings,
	itemIndex: number,
): Promise<SupplyData> {
	const toolDescription = context.getNodeParameter('toolDescription', itemIndex) as string;
	const node = context.getNode();
	const toolName = nodeNameToToolName(node);
	const topK = context.getNodeParameter('topK', itemIndex, 4) as number;
	const includeDocumentMetadata = context.getNodeParameter(
		'includeDocumentMetadata',
		itemIndex,
		true,
	) as boolean;
	const filter = getMetadataFiltersValues(context, itemIndex);
	const vectorStoreTool = new DynamicTool({
		name: toolName,
		description: toolDescription,
		func: async (input) => {
			const vectorStore = await getVectorStoreClient(context, embeddings, itemIndex);
			const embeddedPrompt = await embeddings.embedQuery(input);
			let documents = await vectorStore.similaritySearchVectorWithScore(
				embeddedPrompt,
				topK,
				filter,
			);
			return documents
				.map((document) => {
					if (includeDocumentMetadata) {
						return { type: 'text', text: JSON.stringify(document[0]) };
					}
					return {
						type: 'text',
						text: JSON.stringify({ pageContent: document[0].pageContent }),
					};
				})
				.filter((document) => !!document);
		},
	});
	return {
		response: logWrapper(vectorStoreTool, context),
	};
}
