import type { Embeddings } from '@langchain/core/embeddings';
import type { Document } from '@langchain/core/documents';
import { NodeConnectionType, type IExecuteFunctions, type INodeExecutionData } from 'n8n-workflow';
import { processDocument } from '../shared/processDocument';
import { populateVectorStore } from '../shared/populateVectorStore';

export async function handleInsertOperation(
	context: IExecuteFunctions,
	embeddings: Embeddings,
): Promise<INodeExecutionData[]> {
	const items = context.getInputData();
	// TODO: it should be N8nJsonLoader | N8nBinaryLoader | Array<Document<Record<string, unknown>>>
	// but those types are defined internally and not exposed in the package
	const documentInput = (await context.getInputConnectionData(
		NodeConnectionType.AiDocument,
		0,
	)) as any;
	const resultData: INodeExecutionData[] = [];
	const documentsForEmbedding: Array<Document<Record<string, unknown>>> = [];

	for (let i = 0; i < items.length; i++) {
		if (context.getExecutionCancelSignal()?.aborted) {
			break;
		}

		const { processedDocuments, serializedDocuments } = await processDocument(
			documentInput,
			items[i],
			i,
		);
		resultData.push(...serializedDocuments);
		documentsForEmbedding.push(...processedDocuments);
	}

	// TODO: add this property
	const embeddingBatchSize =
		(context.getNodeParameter('embeddingBatchSize', 0, 200) as number) ?? 200;
	for (let i = 0; i < documentsForEmbedding.length; i += embeddingBatchSize) {
		const nextBatch = documentsForEmbedding.slice(i, i + embeddingBatchSize);
		await populateVectorStore(context, embeddings, nextBatch, 0);
	}

	return resultData;
}
