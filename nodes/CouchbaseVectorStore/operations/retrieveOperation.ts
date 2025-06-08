import type { Embeddings } from '@langchain/core/embeddings';
import { type ISupplyDataFunctions, type SupplyData } from 'n8n-workflow';
import { getVectorStoreClient } from '../core/getVectorStoreClient';
import { logWrapper } from '../shared/logWrapper';

export async function handleRetrieveOperation(
	context: ISupplyDataFunctions,
	embeddings: Embeddings,
	itemIndex: number,
): Promise<SupplyData> {
	const vectorStore = await getVectorStoreClient(context, embeddings, itemIndex);
	return {
		response: logWrapper(vectorStore, context),
	};
}
