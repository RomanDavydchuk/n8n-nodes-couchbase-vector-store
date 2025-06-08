import type { Embeddings } from '@langchain/core/embeddings';
import { type ISupplyDataFunctions, type SupplyData } from 'n8n-workflow';
import { getMetadataFiltersValues } from '../shared/getMetadataFiltersValues';
import { getVectorStoreClient } from '../getVectorStoreClient';
import { proxy } from '../shared/proxy';

export async function handleRetrieveOperation(
	context: ISupplyDataFunctions,
	embeddings: Embeddings,
	itemIndex: number,
): Promise<SupplyData> {
	const filter = getMetadataFiltersValues(context, itemIndex);
	const vectorStore = await getVectorStoreClient(context, filter, embeddings, itemIndex);
	return {
		response: proxy(vectorStore, context),
	};
}
