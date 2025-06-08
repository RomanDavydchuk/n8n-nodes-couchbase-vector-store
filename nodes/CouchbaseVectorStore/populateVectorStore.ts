import type { Embeddings } from '@langchain/core/embeddings';
import type { Document } from '@langchain/core/documents';
import type { IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import { Cluster } from 'couchbase';
import { CouchbaseVectorStore } from '@langchain/community/vectorstores/couchbase';

export async function populateVectorStore(
	context: IExecuteFunctions | ISupplyDataFunctions,
	embeddings: Embeddings,
	documents: Array<Document<Record<string, unknown>>>,
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
	await CouchbaseVectorStore.fromDocuments(documents, embeddings, {
		cluster,
		bucketName,
		scopeName,
		collectionName,
		indexName,
	});
}
