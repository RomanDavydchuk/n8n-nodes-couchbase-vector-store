import type { IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import { Embeddings } from '@langchain/core/embeddings';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

export async function getVectorStoreClient(
	context: IExecuteFunctions | ISupplyDataFunctions,
	filter: Record<string, never> | undefined,
	embeddings: Embeddings,
	itemIndex: number,
) {
	const tableName = context.getNodeParameter('bucketName', itemIndex, '', {
		extractValue: true,
	}) as string;
	const options = context.getNodeParameter('options', itemIndex, {}) as {
		queryName: string;
	};
	// const credentials = await context.getCredentials('couchbaseApi');
	return await SupabaseVectorStore.fromExistingIndex(embeddings, {
		client: null,
		tableName,
		queryName: options.queryName ?? 'match_documents',
		filter,
	});
}
