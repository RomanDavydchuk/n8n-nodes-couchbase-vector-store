import { Cluster } from 'couchbase';
import type { ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';

export async function bucketSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials('couchbaseApi');
	const client = await Cluster.connect(credentials.connectionString as string, {
		username: credentials.username as string,
		password: credentials.password as string,
	});
	const buckets = await client.buckets().getAllBuckets();
	return {
		results: buckets.map((b) => ({
			name: b.name,
			value: b.name,
		})),
	};
}

export async function scopeSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
	const bucketName = this.getNodeParameter('bucketName', '', {
		extractValue: true,
	}) as string;
	if (!bucketName) {
		return {
			results: [],
		};
	}

	const credentials = await this.getCredentials('couchbaseApi');
	const client = await Cluster.connect(credentials.connectionString as string, {
		username: credentials.username as string,
		password: credentials.password as string,
	});
	const bucket = client.bucket(bucketName);
	const scopes = await bucket.collections().getAllScopes();
	return {
		results: scopes.map((s) => ({
			name: s.name,
			value: s.name,
		})),
	};
}

export async function collectionSearch(
	this: ILoadOptionsFunctions,
): Promise<INodeListSearchResult> {
	const bucketName = this.getNodeParameter('bucketName', '', {
		extractValue: true,
	}) as string;
	const scopeName = this.getNodeParameter('scopeName', '', {
		extractValue: true,
	}) as string;

	if (!bucketName || !scopeName) {
		return {
			results: [],
		};
	}

	const credentials = await this.getCredentials('couchbaseApi');
	const client = await Cluster.connect(credentials.connectionString as string, {
		username: credentials.username as string,
		password: credentials.password as string,
	});
	const bucket = client.bucket(bucketName);
	const scopes = await bucket.collections().getAllScopes();
	const scope = scopes.find((s) => s.name === scopeName);
	if (!scope) {
		return {
			results: [],
		};
	}

	return {
		results: scope.collections.map((c) => ({
			name: c.name,
			value: c.name,
		})),
	};
}

// TODO: Add index search
