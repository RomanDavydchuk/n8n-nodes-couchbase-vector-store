import type { Callbacks } from '@langchain/core/callbacks/manager';
import type { Document } from '@langchain/core/documents';
import { Tool } from '@langchain/core/tools';
import { VectorStore } from '@langchain/core/vectorstores';
import type { IDataObject, IExecuteFunctions, ISupplyDataFunctions } from 'n8n-workflow';
import { NodeOperationError, NodeConnectionType, parseErrorMetadata } from 'n8n-workflow';

export async function callMethodAsync<T>(
	this: T,
	parameters: {
		executeFunctions: IExecuteFunctions | ISupplyDataFunctions;
		connectionType: NodeConnectionType;
		currentNodeRunIndex: number;
		method: (...args: any[]) => Promise<unknown>;
		arguments: unknown[];
	},
): Promise<unknown> {
	try {
		return await parameters.method.call(this, ...parameters.arguments);
	} catch (e) {
		const connectedNode = parameters.executeFunctions.getNode();
		const error = new NodeOperationError(connectedNode, e, {
			functionality: 'configuration-node',
		});
		const metadata = parseErrorMetadata(error);
		parameters.executeFunctions.addOutputData(
			parameters.connectionType,
			parameters.currentNodeRunIndex,
			error,
			metadata,
		);
		if (error.message) {
			if (!error.description) {
				error.description = error.message;
			}

			throw error;
		}

		throw new NodeOperationError(
			connectedNode,
			`Error on node "${connectedNode.name}" which is connected via input "${parameters.connectionType}"`,
			{ functionality: 'configuration-node' },
		);
	}
}

export function proxy<T extends VectorStore | Tool>(
	originalInstance: T,
	executeFunctions: IExecuteFunctions | ISupplyDataFunctions,
): T {
	return new Proxy(originalInstance, {
		get: (target, prop) => {
			let connectionType: NodeConnectionType | undefined;
			if (originalInstance instanceof VectorStore) {
				if (prop === 'similaritySearch' && 'similaritySearch' in target) {
					return async (
						query: string,
						k?: number,
						filter?: any, // TODO: it was `BiquadFilterType | undefined`, not sure what it is
						_callbacks?: Callbacks | undefined,
					): Promise<Document[]> => {
						connectionType = NodeConnectionType.AiVectorStore;
						const { index } = executeFunctions.addInputData(connectionType, [
							[{ json: { query, k, filter } }],
						]);
						const response = (await callMethodAsync.call(target, {
							executeFunctions,
							connectionType,
							currentNodeRunIndex: index,
							method: target[prop],
							arguments: [query, k, filter, _callbacks],
						})) as Array<Document<Record<string, any>>>;
						executeFunctions.addOutputData(connectionType, index, [[{ json: { response } }]]);

						return response;
					};
				}
			} else {
				if (prop === '_call' && '_call' in target) {
					return async (query: string): Promise<string> => {
						connectionType = NodeConnectionType.AiTool;
						const inputData: IDataObject = { query };
						if (target.metadata?.isFromToolkit) {
							inputData.tool = {
								name: target.name,
								description: target.description,
							};
						}
						const { index } = executeFunctions.addInputData(connectionType, [
							[{ json: inputData }],
						]);
						const response = (await callMethodAsync.call(target, {
							executeFunctions,
							connectionType,
							currentNodeRunIndex: index,
							method: target[prop],
							arguments: [query],
						})) as string;
						executeFunctions.addOutputData(connectionType, index, [[{ json: { response } }]]);
						if (typeof response === 'string') {
							return response;
						}

						return JSON.stringify(response);
					};
				}
			}

			return (target as any)[prop];
		},
	});
}
