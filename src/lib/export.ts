import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { GeneratedFile } from '../services/ai';

export const exportProjectToZip = async (projectName: string, files: GeneratedFile[]) => {
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.path, file.content);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${projectName.toLowerCase().replace(/\s+/g, '-')}.zip`);
};
