
import React, { useState, useRef, useMemo } from 'react';
import { Document, Client, User, UserRole } from '../types';

interface DocumentManagerProps {
  focusedClient?: Client | null;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  currentUser?: User | null;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ 
  focusedClient, 
  documents, 
  setDocuments,
  currentUser 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // REGRA DE PERMISSÃO: Administrador vs Cliente
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  // Isolamento por Empresa (Mandatário)
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => focusedClient ? doc.ownerId === focusedClient.id : true);
  }, [documents, focusedClient]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      alert("Acesso Negado: Apenas administradores podem enviar novos documentos.");
      return;
    }

    if (!focusedClient) {
      alert("Erro: Selecione uma empresa antes de realizar o upload.");
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
        progress += Math.random() * 25;
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
      }, 150);
    }
  };

  const handleDeleteDocument = (id: string) => {
    if (!isAdmin) {
      alert("Acesso Negado: Apenas administradores podem excluir documentos.");
      return;
    }

    if (confirm("Deseja excluir permanentemente este documento?")) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">Repositório de Arquivos</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            {focusedClient ? `Visualizando: ${focusedClient.name}` : 'Acesso Global de Documentos'}
          </p>
        </div>
        
        {/* Botão de Upload: Visível apenas para Administradores */}
        {isAdmin && focusedClient && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 transition-all ${
              isUploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isUploading ? 'Sincronizando...' : 'Novo Arquivo +'}
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          </button>
        )}
      </header>

      {isUploading && (
        <div className="bg-slate-900 border-l-4 border-blue-500 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enviando Arquivo</p>
              <h4 className="font-black text-white text-sm truncate max-w-[250px]">{uploadingFileName}</h4>
            </div>
            <span className="text-2xl font-black text-blue-400">{uploadProgress}%</span>
          </div>
          <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 shadow-[0_0_10px_#3b82f6]" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center space-x-3">
          <span className="text-xl">ℹ️</span>
          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest leading-relaxed">
            Painel de Consulta: Download de guias e documentos liberado. O envio e exclusão são realizados exclusivamente pela equipe de administração.
          </p>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
            <tr>
              <th className="px-8 py-6">Tipo</th>
              <th className="px-8 py-6">Documento</th>
              <th className="px-8 py-6">Data Upload</th>
              <th className="px-8 py-6">Tamanho</th>
              <th className="px-8 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black border ${
                     doc.type === 'PDF' ? 'bg-red-50 text-red-600 border-red-100' : 
                     doc.type === 'XLSX' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                     'bg-slate-50 text-slate-500 border-slate-100'
                   }`}>
                     {doc.type}
                   </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-black text-sm text-slate-800 block group-hover:text-blue-600 transition-colors">{doc.name}</span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs font-bold text-slate-500">{doc.uploadDate.split('-').reverse().join('/')}</p>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-lg uppercase">{doc.size}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end items-center space-x-2">
                    {/* Botão de Download: Disponível para todos */}
                    <button 
                      title="Fazer Download"
                      className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      ⬇️
                    </button>
                    
                    {/* Botão de Excluir: Disponível apenas para Administradores */}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        title="Excluir Arquivo"
                        className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                     <div className="text-4xl">📁</div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhum documento disponível para esta unidade</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentManager;
