import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useTenant } from '@/contexts/TenantContext';
import { useStore } from '@/contexts/StoreContext';
import { Download, Printer, QrCode } from 'lucide-react';

const QR_SIZE = 200;

function getMenuUrl(tenant: { slug: string; custom_domain?: string | null }) {
  if (tenant.custom_domain) return `https://${tenant.custom_domain}`;
  return `https://cartamenu.shop/${tenant.slug}`;
}

function TableQR({
  url,
  label,
  color,
}: {
  url: string;
  label: string;
  color: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const download = () => {
    // qrcode.react renders inside a <canvas> — find it via the wrapper div
    const wrapper = canvasRef.current;
    if (!wrapper) return;
    const canvas = wrapper.querySelector('canvas');
    if (!canvas) return;

    // Create a new canvas with padding + label
    const out = document.createElement('canvas');
    const pad = 24;
    const labelH = 36;
    out.width = canvas.width + pad * 2;
    out.height = canvas.height + pad * 2 + labelH;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, pad, pad);
    ctx.fillStyle = color;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, out.width / 2, canvas.height + pad + labelH - 8);

    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = `qr-${label.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center bg-white border rounded-xl p-4 shadow-sm gap-3">
      <div ref={canvasRef}>
        <QRCodeCanvas
          value={url}
          size={QR_SIZE}
          fgColor={color}
          bgColor="#ffffff"
          level="M"
          includeMargin
        />
      </div>
      <p className="font-semibold text-gray-800 text-sm">{label}</p>
      <p className="text-xs text-gray-400 text-center break-all max-w-[200px]">{url}</p>
      <button
        onClick={download}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <Download size={13} />
        Baixar PNG
      </button>
    </div>
  );
}

const AdminQRCode = () => {
  const { tenant } = useTenant();
  const { storeInfo } = useStore();

  const [tableCount, setTableCount] = useState(10);
  const [prefix, setPrefix] = useState('Mesa');
  const [includeTable, setIncludeTable] = useState(true);
  const [generated, setGenerated] = useState(false);

  const color = storeInfo.primary_color || '#FF3008';
  const baseUrl = tenant ? getMenuUrl(tenant) : '';

  const tables = Array.from({ length: tableCount }, (_, i) => {
    const num = i + 1;
    const label = `${prefix} ${num}`;
    const url = includeTable ? `${baseUrl}?mesa=${num}` : baseUrl;
    return { label, url };
  });

  const printAll = () => {
    const canvases = document.querySelectorAll<HTMLCanvasElement>('#qr-grid canvas');
    const win = window.open('', '_blank')!;
    win.document.write(`
      <html><head><title>QR Codes — ${storeInfo.name}</title>
      <style>
        body { font-family: sans-serif; background: #fff; margin: 0; padding: 16px; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .card { display: flex; flex-direction: column; align-items: center; border: 1px solid #eee; border-radius: 12px; padding: 16px; page-break-inside: avoid; }
        .label { font-weight: bold; margin-top: 8px; font-size: 14px; color: ${color}; }
        canvas { display: block; }
        @media print { .grid { grid-template-columns: repeat(4, 1fr); } }
      </style></head><body>
      <h2 style="color:${color};margin-bottom:16px">${storeInfo.name} — Códigos QR</h2>
      <div class="grid">
    `);

    canvases.forEach((canvas, i) => {
      win.document.write(`
        <div class="card">
          <img src="${canvas.toDataURL()}" width="${QR_SIZE}" height="${QR_SIZE}" />
          <div class="label">${tables[i].label}</div>
        </div>
      `);
    });

    win.document.write('</div></body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <QrCode size={28} style={{ color }} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Códigos QR para mesas</h1>
          <p className="text-sm text-gray-500">Gere e imprima QR codes para cada mesa do seu restaurante</p>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white border rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-gray-800">Configuração</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Número de mesas</label>
            <input
              type="number"
              min={1}
              max={100}
              value={tableCount}
              onChange={(e) => { setTableCount(Number(e.target.value)); setGenerated(false); }}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': color } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Prefixo da mesa</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => { setPrefix(e.target.value); setGenerated(false); }}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
            />
          </div>

          <div className="flex flex-col justify-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeTable}
                onChange={(e) => { setIncludeTable(e.target.checked); setGenerated(false); }}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Incluir número da mesa na URL</span>
            </label>
            <p className="text-xs text-gray-400 mt-1">Ex: ?mesa=1</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">URL base do cardápio</label>
          <div className="bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-600 font-mono break-all">
            {baseUrl || 'Carregando...'}
          </div>
        </div>

        <button
          onClick={() => setGenerated(true)}
          disabled={!baseUrl}
          className="px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          Gerar QR Codes
        </button>
      </div>

      {/* QR Grid */}
      {generated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {tableCount} QR code{tableCount !== 1 ? 's' : ''} gerado{tableCount !== 1 ? 's' : ''}
            </p>
            <button
              onClick={printAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: color }}
            >
              <Printer size={15} />
              Imprimir todos
            </button>
          </div>

          <div
            id="qr-grid"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {tables.map(({ label, url }) => (
              <TableQR key={label} url={url} label={label} color={color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQRCode;
