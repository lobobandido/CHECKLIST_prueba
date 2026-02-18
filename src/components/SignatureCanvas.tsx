import { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { X, RotateCcw } from 'lucide-react';

interface SignatureCanvasProps {
  title: string;
  onSave: (signature: string) => void;
  onClose: () => void;
}

export default function SignatureCanvas({ title, onSave, onClose }: SignatureCanvasProps) {
  const signaturePadRef = useRef<SignaturePad>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const dataURL = signaturePadRef.current.toDataURL();
      onSave(dataURL);
      onClose();
    }
  };

  const handleBegin = () => {
    setIsEmpty(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="border-2 border-slate-300 rounded-lg bg-slate-50">
            <SignaturePad
              ref={signaturePadRef}
              canvasProps={{
                className: 'w-full h-64 cursor-crosshair',
              }}
              onBegin={handleBegin}
            />
          </div>

          <p className="text-sm text-slate-600 mt-4 text-center">
            Firma en el recuadro superior
          </p>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
          <button
            onClick={handleSave}
            disabled={isEmpty}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar firma
          </button>
        </div>
      </div>
    </div>
  );
}
