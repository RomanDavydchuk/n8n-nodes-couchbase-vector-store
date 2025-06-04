import type { Embeddings } from '@langchain/core/embeddings';
import type { Document } from '@langchain/core/documents';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import type { IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createClient } from '@supabase/supabase-js';

export async function populateVectorStore(
	context: IExecuteFunctions | ISupplyDataFunctions,
	embeddings: Embeddings,
	documents: Array<Document<Record<string, unknown>>>,
	itemIndex: number,
) {
	const tableName = context.getNodeParameter('tableName', itemIndex, '', {
		extractValue: true,
	}) as string;
	const options = context.getNodeParameter('options', itemIndex, {}) as {
		queryName: string;
	};
	const credentials = await context.getCredentials('testVectorStoreApi');
	const client = createClient(credentials.host as string, credentials.serviceRole as string);

	try {
		await SupabaseVectorStore.fromDocuments(documents, embeddings, {
			client,
			tableName,
			queryName: options.queryName ?? 'match_documents',
		});
	} catch (error) {
		if ((error as Error).message === 'Error inserting: undefined 404 Not Found') {
			throw new NodeOperationError(context.getNode(), `Table ${tableName} not found`, {
				itemIndex,
				description: 'Please check that the table exists in your vector store',
			});
		} else {
			throw new NodeOperationError(context.getNode(), error as Error, {
				itemIndex,
			});
		}
	}
}
