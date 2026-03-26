import { GeneratedFile } from '../services/ai';

export interface GitHubConfig {
  token: string;
  repoName: string;
  description: string;
  isPrivate: boolean;
}

export const pushToGitHub = async (config: GitHubConfig, files: GeneratedFile[], onProgress: (msg: string) => void) => {
  const { token, repoName, description, isPrivate } = config;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    onProgress('Creating repository...');
    
    // 1. Get authenticated user
    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) throw new Error('Invalid GitHub token');
    const user = await userRes.json();

    // 2. Create repository
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: repoName,
        description,
        private: isPrivate,
        auto_init: true, // Initialize with README
      }),
    });

    if (!createRepoRes.ok) {
      const err = await createRepoRes.json();
      if (err.errors?.[0]?.message === 'name already exists on this account') {
        onProgress('Repository already exists, pushing to existing repo...');
      } else {
        throw new Error(err.message || 'Failed to create repository');
      }
    }

    // 3. Get latest commit SHA to create a tree
    onProgress('Fetching repository data...');
    const branchRes = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/git/ref/heads/main`, { headers });
    let branchData = await branchRes.json();
    
    // Fallback to master if main doesn't exist
    if (!branchRes.ok) {
      const masterRes = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/git/ref/heads/master`, { headers });
      if (!masterRes.ok) throw new Error('Could not find main or master branch');
      branchData = await masterRes.json();
    }

    const latestCommitSha = branchData.object.sha;

    // 4. Create blobs for all files
    onProgress('Uploading files...');
    const treeItems = await Promise.all(files.map(async (file) => {
      const blobRes = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: file.content,
          encoding: 'utf-8',
        }),
      });
      const blobData = await blobRes.json();
      return {
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      };
    }));

    // 5. Create a new tree
    onProgress('Creating commit tree...');
    const treeRes = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/git/trees`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        base_tree: latestCommitSha,
        tree: treeItems,
      }),
    });
    const treeData = await treeRes.json();

    // 6. Create a commit
    onProgress('Creating commit...');
    const commitRes = await fetch(`https://api.github.com/repos/${user.login}/${repoName}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: 'Initial commit from DevHive Builder',
        tree: treeData.sha,
        parents: [latestCommitSha],
      }),
    });
    const commitData = await commitRes.json();

    // 7. Update the reference
    onProgress('Pushing to branch...');
    await fetch(`https://api.github.com/repos/${user.login}/${repoName}/git/refs/heads/${branchData.ref.split('/').pop()}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: commitData.sha,
      }),
    });

    onProgress('Successfully pushed to GitHub!');
    return `https://github.com/${user.login}/${repoName}`;
  } catch (error) {
    console.error('GitHub push error:', error);
    throw error;
  }
};
