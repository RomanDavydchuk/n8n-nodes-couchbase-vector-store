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
import { NodeConnectionType } from 'n8n-workflow';
import { handleInsertOperation } from './operations/insert';

export class TestVectorStore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Test Vector Store',
		name: 'testVectorStore',
		description: 'Test Vector Store Node',
		icon: 'fa:database',
		iconColor: 'purple', // for visual distinction
		group: ['transform'],
		version: 1,
		defaults: {
			name: 'Test Vector Store',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Vector Stores', 'Tools', 'Root Nodes'],
				Tools: ['Other Tools'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'testvectorstore',
					},
				],
			},
		},
		credentials: [
			{
				name: 'testVectorStoreApi',
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
						name: 'Update Documents',
						value: 'update',
						description: 'Update documents in vector store by ID',
						action: 'Update vector store documents',
					},
					{
						name: 'Retrieve Documents (As Tool for AI Agent)',
						value: 'retrieve-as-tool',
						description: 'Retrieve documents from vector store to be used as tool with AI nodes',
						action: 'Retrieve documents for AI Agent as Tool',
						outputConnectionType: NodeConnectionType.AiTool,
					},
				],
			},
			{
				displayName: 'Table Name',
				name: 'tableName',
				type: 'resourceLocator',
				default: { mode: 'list', value: '' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							// FIXME:
							searchListMethod: 'testTableNameSearch',
						},
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
					},
				],
			},
		],
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

		return [[]];
	}

	async supplyData(this: ISupplyDataFunctions, _itemIndex: number): Promise<SupplyData> {
		return {
			response: {},
		};
	}
}
