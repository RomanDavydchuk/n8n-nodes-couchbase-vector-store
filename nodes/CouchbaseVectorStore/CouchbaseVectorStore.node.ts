import type { Embeddings } from '@langchain/core/embeddings';
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	NodeExecutionWithMetadata,
	SupplyData,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { handleInsertOperation } from './operations/insertOperation';
import { bucketSearch, collectionSearch, scopeSearch } from './methods/listSearch';
import { insertFields } from './descriptions/insertFields';
import { handleLoadOperation } from './operations/loadOperation';
import { loadFields } from './descriptions/loadFields';
import { handleUpdateOperation } from './operations/updateOperation';
import { updateFields } from './descriptions/updateFields';
import { handleRetrieveOperation } from './operations/retrieveOperation';
import { retrieveFields } from './descriptions/retrieveFields';
import { handleRetrieveAsToolOperation } from './operations/retrieveAsToolOperation';
import { retrieveAsToolFields } from './descriptions/retrieveAsToolFields';

export class CouchbaseVectorStore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Couchbase Vector Store',
		name: 'couchbaseVectorStore',
		description: 'Couchbase Vector Store Node',
		// TODO:
		icon: 'fa:database',
		iconColor: 'purple',
		group: ['transform'],
		version: 1,
		defaults: {
			name: 'Couchbase Vector Store',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Vector Stores', 'Tools', 'Root Nodes'],
				'Vector Stores': ['Other Vector Stores'],
				Tools: ['Other Tools'],
			},
		},
		credentials: [
			{
				name: 'couchbaseApi',
				required: true,
			},
		],
		inputs: `={{
			((parameters) => {
				const mode = parameters?.mode;
				const inputs = [{ displayName: "Embedding", type: "${NodeConnectionType.AiEmbedding}", required: true, maxConnections: 1}]

				if (mode === 'retrieve-as-tool') {
					return inputs;
				}

				if (['insert', 'load', 'update'].includes(mode)) {
					inputs.push({ displayName: "", type: "${NodeConnectionType.Main}"})
				}

				if (['insert'].includes(mode)) {
					inputs.push({ displayName: "Document", type: "${NodeConnectionType.AiDocument}", required: true, maxConnections: 1})
				}
				return inputs
			})($parameter)
		}}`,
		outputs: `={{
			((parameters) => {
				const mode = parameters?.mode ?? 'retrieve';

				if (mode === 'retrieve-as-tool') {
					return [{ displayName: "Tool", type: "${NodeConnectionType.AiTool}"}]
				}

				if (mode === 'retrieve') {
					return [{ displayName: "Vector Store", type: "${NodeConnectionType.AiVectorStore}"}]
				}
				return [{ displayName: "", type: "${NodeConnectionType.Main}"}]
			})($parameter)
		}}`,
		properties: [
			{
				displayName: 'Operation Mode',
				name: 'mode',
				type: 'options',
				noDataExpression: true,
				default: 'retrieve',
				options: [
					{
						name: 'Get Many',
						value: 'load',
						description: 'Get many ranked documents from vector store for query',
						action: 'Get ranked documents from vector store',
					},
					{
						name: 'Insert Documents',
						value: 'insert',
						description: 'Insert documents into vector store',
						action: 'Add documents to vector store',
					},
					{
						name: 'Retrieve Documents (As Vector Store for Chain/Tool)',
						value: 'retrieve',
						description:
							'Retrieve documents from vector store to be used as vector store with AI nodes',
						action: 'Retrieve documents for Chain/Tool as Vector Store',
						outputConnectionType: NodeConnectionType.AiVectorStore,
					},
					{
						name: 'Retrieve Documents (As Tool for AI Agent)',
						value: 'retrieve-as-tool',
						description: 'Retrieve documents from vector store to be used as tool with AI nodes',
						action: 'Retrieve documents for AI Agent as Tool',
						outputConnectionType: NodeConnectionType.AiTool,
					},
					{
						name: 'Update Documents',
						value: 'update',
						description: 'Update documents in vector store by ID',
						action: 'Update vector store documents',
					},
				],
			},
			{
				displayName: 'Bucket Name',
				name: 'bucketName',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'bucketSearch',
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
					},
				],
			},
			{
				displayName: 'Scope Name',
				name: 'scopeName',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'scopeSearch',
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
					},
				],
			},
			{
				displayName: 'Collection Name',
				name: 'collectionName',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'collectionSearch',
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
					},
				],
			},
			{
				displayName: 'Index Name',
				name: 'indexName',
				type: 'string',
				default: '',
				placeholder: 'vector-index',
			},
			...insertFields,
			...loadFields,
			...updateFields,
			...retrieveFields,
			...retrieveAsToolFields,
		],
	};

	methods = {
		listSearch: {
			bucketSearch,
			scopeSearch,
			collectionSearch,
		},
	};

	async execute(
		this: IExecuteFunctions,
	): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
		const mode = this.getNodeParameter('mode', 0) as string;
		const embeddings = (await this.getInputConnectionData(
			NodeConnectionType.AiEmbedding,
			0,
		)) as Embeddings;
		if (mode === 'insert') {
			const resultData = await handleInsertOperation(this, embeddings);
			return [resultData];
		}

		if (mode === 'load') {
			const items = this.getInputData(0);
			const resultData: INodeExecutionData[] = [];
			for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
				const docs = await handleLoadOperation(this, embeddings, itemIndex);
				resultData.push(...docs);
			}
			return [resultData];
		}

		if (mode === 'update') {
			const resultData = await handleUpdateOperation(this, embeddings);
			return [resultData];
		}

		throw new NodeOperationError(
			this.getNode(),
			'Only the "load", "update" and "insert" operation modes are supported with execute',
		);
	}

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const mode = this.getNodeParameter('mode', 0);
		const embeddings = (await this.getInputConnectionData(
			NodeConnectionType.AiEmbedding,
			0,
		)) as Embeddings;
		if (mode === 'retrieve') {
			return await handleRetrieveOperation(this, embeddings, itemIndex);
		}

		if (mode === 'retrieve-as-tool') {
			return await handleRetrieveAsToolOperation(this, embeddings, itemIndex);
		}

		throw new NodeOperationError(
			this.getNode(),
			'Only the "retrieve" and "retrieve-as-tool" operation mode is supported to supply data',
		);
	}
}
