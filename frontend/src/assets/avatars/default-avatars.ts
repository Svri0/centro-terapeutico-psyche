// Avatares de robots para psicólogos
export const AVATARS_ANIMALES = [
  {
    id: 'robot-1',
    name: 'Robot León',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=lion&backgroundColor=ffdfbf',
    description: ''
  },
  {
    id: 'robot-2', 
    name: 'Robot Delfín',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=dolphin&backgroundColor=bfdfff',
    description: ''
  },
  {
    id: 'robot-3',
    name: 'Robot Búho',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=owl&backgroundColor=8b4513',
    description: ''
  },
  {
    id: 'robot-4',
    name: 'Robot Mariposa',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=butterfly&backgroundColor=ffb6c1',
    description: ''
  },
  {
    id: 'robot-5',
    name: 'Robot Abeja',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bee&backgroundColor=ffff00',
    description: ''
  },
  {
    id: 'robot-6',
    name: 'Robot Tortuga',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=turtle&backgroundColor=90ee90',
    description: ''
  },
  {
    id: 'robot-7',
    name: 'Robot Conejo',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=rabbit&backgroundColor=ffffff',
    description: ''
  },
  {
    id: 'robot-8',
    name: 'Robot Pingüino',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=penguin&backgroundColor=000000',
    description: ''
  },
  {
    id: 'robot-9',
    name: 'Robot Jirafa',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=giraffe&backgroundColor=daa520',
    description: ''
  },
  {
    id: 'robot-10',
    name: 'Robot Koala',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=koala&backgroundColor=8b4513',
    description: ''
  },
  {
    id: 'robot-11',
    name: 'Robot Panda',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=panda&backgroundColor=000000',
    description: ''
  }
];

export const getAvatarById = (id: string) => {
  return AVATARS_ANIMALES.find(avatar => avatar.id === id);
};

export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * AVATARS_ANIMALES.length);
  return AVATARS_ANIMALES[randomIndex];
};

export const getDefaultAvatar = () => {
  return AVATARS_ANIMALES[0];
}; 