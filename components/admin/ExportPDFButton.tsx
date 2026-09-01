"use client";

import { Download } from "lucide-react";

export default function ExportPDFButton() {
  const handleExport = () => {
    window.print();
  };

  return (
    <button
      onClick={handleExport}
      className="print:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
    >
      <Download className="w-4 h-4" />
      Exporter (PDF)
    </button>
  );
}
