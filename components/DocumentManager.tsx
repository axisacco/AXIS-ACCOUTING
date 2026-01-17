
import React, { useState, useRef, useMemo } from 'react';
import { Document, Client } from '../types';

interface DocumentManagerProps {
  focusedClient?: Client | null;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ focusedClient, documents, setDocuments }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // REGRA DE OURO: Isolamento por Empresa (Mandatário)
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => focusedClient ? doc.ownerId === focusedClient.id : true);
  }, [documents, focusedClient]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!focusedClient) {
      alert("Erro: Selecione uma empresa ou foque em um cliente antes do upload.");
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileSizeMB = file.size / (1024 * 1024);
      
      setIsUploading(true);
      setUploadProgress(0);
      setUploadingFileName(file.name);
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          setUploadProgress(100);
          clearInterval(interval);
          setTimeout(() => {
            const newDoc: Document = {
              id: `DOC_${Math.random().toString(36).substr(2, 9)}`,
              name: file.name,
              type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
              uploadDate: new Date().toISOString().split('T')[0],
              size: fileSizeMB < 1 ? `${(file.size / 1024).toFixed(0)} KB` : `${fileSizeMB.toFixed(1)} MB`,
              category: 'other',
              ownerId: focusedClient.id
            };
            setDocuments(prev => [newDoc, ...prev]);
            setIsUploading(false);
            setUploadProgress(0);
            setUploadingFileName('');
          }, 500);
        } else {
          setUploadProgress(Math.floor(progress));
        }
      }, 100);
    }
  };

  const categoryLabels = { invoice: 'Nota Fiscal', contract: 'Contrato', tax_report: 'Relatório', other: 'Outros' };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Gestão de Arquivos Permanentes</h2>
          <p className="text-slate-500 text-xs md:text-sm">
            {focusedClient ? `Exclusivo: ${focusedClient.name}` : 'Acesso Global do Escritório'}
          </p>
        </div>
        
        {focusedClient && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full md:w-auto px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all ${
              isUploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? 'Processando...' : 'Enviar Documento'}
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          </button>
        )}
      </header>

      {isUploading && (
        <div className="bg-white border-2 border-blue-500/10 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-slate-800 text-xs truncate max-w-[200px]">{uploadingFileName}</h4>
            <span className="text-lg font-black text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
            <tr>
              <th className="px-6 py-5">Nome do Arquivo</th>
              <th className="px-6 py-5">Upload</th>
              <th className="px-6 py-5">Tamanho</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-5 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[8px] font-black">{doc.type}</div>
                  <span className="font-bold text-sm text-slate-800">{doc.name}</span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-xs font-bold text-slate-600">{doc.uploadDate.split('-').reverse().join('/')}</p>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[10px] font-black text-slate-400">{doc.size}</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-blue-600 hover:scale-110 transition-transform">⬇️</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase text-xs">Nenhum documento nesta empresa.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentManager;
