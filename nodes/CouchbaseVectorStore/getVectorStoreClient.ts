import type { IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import { Embeddings } from '@langchain/core/embeddings';
import { Cluster } from 'couchbase';
import { CouchbaseVectorStore } from '@langchain/community/vectorstores/couchbase';

export async function getVectorStoreClient(
	context: IExecuteFunctions | ISupplyDataFunctions,
	_filter: Record<string, never> | undefined,
	embeddings: Embeddings,
	itemIndex: number,
) {
	const bucketName = context.getNodeParameter('bucketName', itemIndex, '', {
		extractValue: true,
	}) as string;
	const scopeName = context.getNodeParameter('scopeName', itemIndex, '', {
		extractValue: true,
	}) as string;
	const collectionName = context.getNodeParameter('collectionName', itemIndex, '', {
		extractValue: true,
	}) as string;
	const indexName = context.getNodeParameter('indexName', itemIndex, '') as string;
	const credentials = await context.getCredentials('couchbaseApi');
	const cluster = await Cluster.connect(credentials.connectionString as string, {
		username: credentials.username as string,
		password: credentials.password as string,
	});
	return await CouchbaseVectorStore.initialize(embeddings, {
		cluster,
		bucketName,
		scopeName,
		collectionName,
		indexName,
	});
}
