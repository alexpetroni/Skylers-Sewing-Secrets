import 'dotenv/config';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, readdir, stat } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));

const STORAGE_ZONE = process.env.PUBLIC_BUNNY_STORAGE_ZONE || 'skyler-storage';
const API_KEY = process.env.BUNNY_API_KEY;
const STORAGE_API_URL = `https://storage.bunnycdn.com/${STORAGE_ZONE}`;
const CDN_URL = process.env.PUBLIC_BUNNY_CDN_URL || `https://skyler-storage.b-cdn.net`;

if (!API_KEY) {
	console.error('❌ BUNNY_API_KEY not found in environment variables');
	process.exit(1);
}

interface FileToUpload {
	local: string;
	remote: string;
}

interface UploadResult {
	local: string;
	remote: string;
	success: boolean;
	error?: string;
}

async function uploadFile(localPath: string, remotePath: string): Promise<UploadResult> {
	try {
		const fileBuffer = await readFile(localPath);
		const fileStats = await stat(localPath);
		const contentType = getContentType(localPath);

		console.log(`📤 Uploading: ${localPath} → ${remotePath} (${fileStats.size} bytes)`);

		const headers = new Headers();
		headers.set('AccessKey', API_KEY || '');
		headers.set('Content-Type', contentType);

		const response = await fetch(`${STORAGE_API_URL}/${remotePath}`, {
			method: 'PUT',
			headers: headers,
			body: fileBuffer,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP ${response.status}: ${errorText}`);
		}

		return { local: localPath, remote: remotePath, success: true };
	} catch (error) {
		console.error(`❌ Failed to upload ${localPath}:`, error);
		return { local: localPath, remote: remotePath, success: false, error: String(error) };
	}
}

function getContentType(filePath: string): string {
	const ext = filePath.split('.').pop()?.toLowerCase();
	const contentTypes: Record<string, string> = {
		'jpg': 'image/jpeg',
		'jpeg': 'image/jpeg',
		'png': 'image/png',
		'webp': 'image/webp',
		'svg': 'image/svg+xml',
		'txt': 'text/plain',
	};
	return contentTypes[ext || ''] || 'application/octet-stream';
}

async function walkDirectory(dir: string): Promise<string[]> {
	const files: string[] = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...await walkDirectory(fullPath));
		} else if (entry.isFile()) {
			files.push(fullPath);
		}
	}

	return files;
}

async function main() {
	console.log('🚀 Starting Bunny.net Storage upload...\n');

	const staticImagesPath = join(__dirname, '..', 'static', 'images');
	const staticLogosPath = join(__dirname, '..', 'static', 'logo');
	const staticRootPath = join(__dirname, '..', 'static');

	const allFiles: FileToUpload[] = [];

	try {
		if ((await stat(staticImagesPath)).isDirectory()) {
			const imageFiles = await walkDirectory(staticImagesPath);
			for (const file of imageFiles) {
				const relativePath = file.replace(staticImagesPath, '');
				allFiles.push({ local: file, remote: `/images${relativePath}` });
			}
		}

		try {
			if ((await stat(staticLogosPath)).isDirectory()) {
				const logoFiles = await walkDirectory(staticLogosPath);
				for (const file of logoFiles) {
					const relativePath = file.replace(staticLogosPath, '');
					allFiles.push({ local: file, remote: `/logo${relativePath}` });
				}
			}
		} catch {
			console.log(`⚠️  Logo directory not found, skipping`);
		}

		const rootFiles = [
			join(staticRootPath, 'favicon.png'),
			join(staticRootPath, 'robots.txt'),
		];
		for (const file of rootFiles) {
			try {
				await stat(file);
				const filename = file.split('/').pop();
				allFiles.push({ local: file, remote: `/${filename}` });
			} catch {
				console.log(`⚠️  File not found, skipping: ${file}`);
			}
		}

	} catch (error) {
		console.error('❌ Error scanning static directory:', error);
		process.exit(1);
	}

	console.log(`\n📁 Found ${allFiles.length} files to upload\n`);

	const results: UploadResult[] = [];

	for (const { local, remote } of allFiles) {
		const result = await uploadFile(local, remote);
		results.push(result);
	}

	const successful = results.filter(r => r.success);
	const failed = results.filter(r => !r.success);

	console.log(`\n✅ Upload complete!`);
	console.log(`   - Success: ${successful.length}`);
	console.log(`   - Failed: ${failed.length}`);

	if (failed.length > 0) {
		console.log(`\n❌ Failed uploads:`);
		for (const failure of failed) {
			console.log(`   - ${failure.local}: ${failure.error}`);
		}
		process.exit(1);
	}

	console.log(`\n🌐 CDN URL: ${CDN_URL}`);
	console.log(`\n💡 Example optimized image URL:`);
	console.log(`   ${CDN_URL}/images/fabrics/cotton.jpg?width=800&quality=80\n`);
}

main();
