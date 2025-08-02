import React, { useState } from 'react';
import { AVATARS_ANIMALES, getAvatarById } from '../assets/avatars/default-avatars';

interface AvatarSelectorProps {
  selectedAvatarId?: string;
  onAvatarSelect: (avatarId: string, avatarUrl: string) => void;
  title?: string;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
  selectedAvatarId, 
  onAvatarSelect, 
  title = "Seleccionar Foto de Perfil" 
}) => {
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  const handleAvatarClick = (avatarId: string, avatarUrl: string) => {
    onAvatarSelect(avatarId, avatarUrl);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      
             <div className="grid grid-cols-4 gap-4">
         {AVATARS_ANIMALES.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id;
          const isHovered = hoveredAvatar === avatar.id;
          
          return (
            <div
              key={avatar.id}
              className={`
                relative group cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'ring-4 ring-orange-500 ring-offset-2' 
                  : 'hover:ring-2 hover:ring-orange-300 ring-offset-2'
                }
                ${isHovered ? 'scale-105' : 'scale-100'}
              `}
              onClick={() => handleAvatarClick(avatar.id, avatar.url)}
              onMouseEnter={() => setHoveredAvatar(avatar.id)}
              onMouseLeave={() => setHoveredAvatar(null)}
            >
              {/* Avatar Image */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
                             {/* Hover Info */}
               <div className={`
                 absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-full
                 transition-opacity duration-200
                 ${isHovered ? 'opacity-100' : 'opacity-0'}
               `}>
                 <div className="text-center">
                   <div className="font-medium">{avatar.name}</div>
                 </div>
               </div>
            </div>
          );
        })}
      </div>
      
      {/* Selected Avatar Info */}
      {selectedAvatarId && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img
                src={getAvatarById(selectedAvatarId)?.url}
                alt="Avatar seleccionado"
                className="w-full h-full object-cover"
              />
            </div>
                         <div>
               <p className="font-medium text-gray-800">
                 {getAvatarById(selectedAvatarId)?.name}
               </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector; 