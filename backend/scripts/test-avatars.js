const axios = require('axios');

// URLs de los avatares de robots
const avatarUrls = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=lion&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/bottts/svg?seed=dolphin&backgroundColor=bfdfff',
  'https://api.dicebear.com/7.x/bottts/svg?seed=owl&backgroundColor=8b4513',
  'https://api.dicebear.com/7.x/bottts/svg?seed=butterfly&backgroundColor=ffb6c1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=bee&backgroundColor=ffff00',
  'https://api.dicebear.com/7.x/bottts/svg?seed=turtle&backgroundColor=90ee90',
  'https://api.dicebear.com/7.x/bottts/svg?seed=rabbit&backgroundColor=ffffff',
  'https://api.dicebear.com/7.x/bottts/svg?seed=penguin&backgroundColor=000000',
  'https://api.dicebear.com/7.x/bottts/svg?seed=giraffe&backgroundColor=daa520',
  'https://api.dicebear.com/7.x/bottts/svg?seed=koala&backgroundColor=8b4513',
  'https://api.dicebear.com/7.x/bottts/svg?seed=panda&backgroundColor=000000'
];

const avatarNames = [
  'Robot León',
  'Robot Delfín', 
  'Robot Búho',
  'Robot Mariposa',
  'Robot Abeja',
  'Robot Tortuga',
  'Robot Conejo',
  'Robot Pingüino',
  'Robot Jirafa',
  'Robot Koala',
  'Robot Panda'
];

async function testAvatarUrl(url, name) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    console.log(`✅ ${name}: ${response.status} - ${response.headers['content-type']}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

async function testAllAvatars() {
  console.log('🧪 Probando URLs de avatares de robots...\n');
  
  let successCount = 0;
  let totalCount = avatarUrls.length;
  
  for (let i = 0; i < avatarUrls.length; i++) {
    const success = await testAvatarUrl(avatarUrls[i], avatarNames[i]);
    if (success) successCount++;
    
    // Pequeña pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Resultados: ${successCount}/${totalCount} URLs funcionan`);
  
  if (successCount === totalCount) {
    console.log('🎉 Todas las URLs de avatares funcionan correctamente!');
  } else {
    console.log('⚠️ Algunas URLs de avatares no funcionan');
  }
}

testAllAvatars(); 