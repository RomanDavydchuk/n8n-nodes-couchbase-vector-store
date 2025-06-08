import type { Embeddings } from '@langchain/core/embeddings';
import { type ISupplyDataFunctions, type SupplyData } from 'n8n-workflow';
import { getVectorStoreClient } from '../getVectorStoreClient';
import { proxy } from '../shared/proxy';

export async function handleRetrieveOperation(
	context: ISupplyDataFunctions,
	embeddings: Embeddings,
	itemIndex: number,
): Promise<SupplyData> {
	const vectorStore = await getVectorStoreClient(context, embeddings, itemIndex);
	return {
		response: proxy(vectorStore, context),
	};
}
