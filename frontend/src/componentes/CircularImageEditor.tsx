import React, { useState, useRef, useEffect } from 'react';

interface CircularImageEditorProps {
  onImageSelect: (file: File | null) => void;
  currentImageUrl?: string;
  className?: string;
}

const CircularImageEditor: React.FC<CircularImageEditorProps> = ({ 
  onImageSelect, 
  currentImageUrl, 
  className = '' 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreviewUrl(url);
        setIsEditing(true);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!isEditing) {
      fileInputRef.current?.click();
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setIsEditing(false);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isEditing) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };



  const saveImage = () => {
    if (canvasRef.current && imageRef.current && previewUrl) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const size = 200; // Resolución máxima y círculo perfecto

      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();

        const img = imageRef.current;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // Calcular el lado más corto para centrar el recorte
        const minSide = Math.min(imgWidth, imgHeight);

        // Coordenadas para recortar el centro
        const sx = (imgWidth - minSide) / 2;
        const sy = (imgHeight - minSide) / 2;

        // Dibujar el centro de la imagen, ajustado a 200x200
        ctx.drawImage(
          img,
          sx, sy, minSide, minSide,
          0, 0, size, size
        );

        ctx.restore();

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'profile-image.png', { type: 'image/png' });
            
            // Crear URL para preview (debug)
            const previewUrl = URL.createObjectURL(blob);
            console.log('Imagen recortada generada:', {
              size: blob.size,
              type: blob.type,
              previewUrl: previewUrl
            });
            
            onImageSelect(file);
            setIsEditing(false);
          }
        }, 'image/png');
      }
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleWheelEvent = (e: WheelEvent) => {
      if (isEditing) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('wheel', handleWheelEvent, { passive: false });
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('wheel', handleWheelEvent);
    };
  }, [isEditing]);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Foto de Perfil
      </label>
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${isDragOver 
            ? 'border-amber-400 bg-amber-50' 
            : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50'
          }
          ${isEditing ? 'cursor-default' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
                 onMouseDown={handleMouseDown}
         onMouseMove={handleMouseMove}
         onMouseUp={handleMouseUp}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        
        {previewUrl ? (
          <div className="space-y-4">
            {isEditing ? (
              <div className="relative">
                <div className="relative w-48 h-48 mx-auto overflow-hidden rounded-full border-4 border-amber-500">
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Editar"
                    className="absolute w-full h-full object-cover"
                    style={{
                      transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                      cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    draggable={false}
                  />
                  {/* Guía de recorte */}
                  <div className="absolute inset-0 border-2 border-white border-dashed pointer-events-none"></div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>• Arrastra para mover la imagen</p>
                  <p>• Usa la rueda del mouse para hacer zoom</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Zoom actual: {Math.round(scale * 100)}%
                  </p>
                </div>
                <div className="flex justify-center space-x-2 mt-3">
                  <button
                    type="button"
                    onClick={saveImage}
                    className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mx-auto h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                />
                <p className="text-sm text-gray-600">
                  Haz clic para editar la imagen
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remover imagen
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-medium text-amber-600 hover:text-amber-500">
                  Haz clic para subir
                </span>{' '}
                o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF hasta 5MB
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Canvas oculto para generar la imagen final */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CircularImageEditor; 