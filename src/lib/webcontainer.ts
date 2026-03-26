import { WebContainer, FileSystemTree } from '@webcontainer/api';
import { GeneratedFile } from '../services/ai';

let bootPromise: Promise<WebContainer> | null = null;

export async function getWebContainer(): Promise<WebContainer> {
  if (!bootPromise) {
    bootPromise = WebContainer.boot();
  }
  return bootPromise;
}

export function filesToTree(files: GeneratedFile[]): FileSystemTree {
  const tree: FileSystemTree = {};

  for (const file of files) {
    const parts = file.path.split('/');
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = { directory: {} };
      }
      current = (current[part] as any).directory;
    }

    const fileName = parts[parts.length - 1];
    current[fileName] = {
      file: { contents: file.content }
    };
  }

  return tree;
}
