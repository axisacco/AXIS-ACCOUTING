
import React, { useState } from 'react';
import { Document } from '../types';

const initialDocs: Document[] = [
  { id: '1', name: 'Contrato Social.pdf', type: 'PDF', uploadDate: '2024-05-15', size: '2.4 MB', category: 'contract' },
  { id: '2', name: 'NF-e Maio 2024.pdf', type: 'PDF', uploadDate: '2024-06-01', size: '1.1 MB', category: 'invoice' },
  { id: '3', name: 'Balancete_Q1.xlsx', type: 'Excel', uploadDate: '2024-04-10', size: '850 KB', category: 'tax_report' },
  { id: '4', name: 'Comprovante DAS.png', type: 'Imagem', uploadDate: '2024-06-20', size: '400 KB', category: 'tax_report' },
];

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(initialDocs);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const file = e.target.files[0];
      
      // Simulating a network delay
      setTimeout(() => {
        const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.split('/')[1].toUpperCase(),
          uploadDate: new Date().toISOString().split('T')[0],
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          category: 'other'
        };
        setDocuments([newDoc, ...documents]);
        setIsUploading(false);
      }, 1500);
    }
  };

  const categoryLabels = {
    invoice: 'Nota Fiscal',
    contract: 'Contrato',
    tax_report: 'Relatório',
    other: 'Outros'
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Documentos</h2>
          <p className="text-slate-500">Gerencie seus arquivos contábeis com segurança.</p>
        </div>
        
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 font-medium shadow-md">
          <span>{isUploading ? 'Enviando...' : 'Enviar Documento'}</span>
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
        </label>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2">
          {['Todos', 'Notas Fiscais', 'Contratos', 'Impostos'].map(filter => (
            <button key={filter} className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all border border-transparent hover:border-slate-200">
              {filter}
            </button>
          ))}
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4">Nome do Arquivo</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Data de Upload</th>
              <th className="px-6 py-4">Tamanho</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold text-[10px]">
                      {doc.type}
                    </div>
                    <span className="font-medium text-slate-700">{doc.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded uppercase">
                    {categoryLabels[doc.category as keyof typeof categoryLabels]}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">{doc.uploadDate}</td>
                <td className="px-6 py-4 text-slate-500 text-sm">{doc.size}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentManager;
