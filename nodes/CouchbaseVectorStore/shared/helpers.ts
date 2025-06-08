import type { IExecuteFunctions, INode, ISupplyDataFunctions } from 'n8n-workflow';

// TODO: is this required?
export function getMetadataFiltersValues(
	ctx: IExecuteFunctions | ISupplyDataFunctions,
	itemIndex: number,
): Record<string, never> | undefined {
	const options = ctx.getNodeParameter('options', itemIndex, {});

	if (options.metadata) {
		const { metadataValues: metadata } = options.metadata as {
			metadataValues: Array<{
				name: string;
				value: string;
			}>;
		};
		if (metadata.length > 0) {
			return metadata.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {});
		}
	}

	if (options.searchFilterJson) {
		return ctx.getNodeParameter('options.searchFilterJson', itemIndex, '', {
			ensureType: 'object',
		}) as Record<string, never>;
	}

	return undefined;
}

export function nodeNameToToolName(node: INode): string {
	return node.name.replace(/[\s.?!=+#@&*()[\]{}:;,<>\/\\'"^%$]/g, '_').replace(/_+/g, '_');
}
