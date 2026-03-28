const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs');
const path = require('path');

(async () => {
  // 1. Lanzamos el navegador en modo invisible
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 720 });

  // 2. Buscamos todos tus archivos .html (excluyendo el que será el índice)
  const files = fs.readdirSync('.').filter(f => 
    f.endsWith('.html') && 
    f !== 'index.html' && 
    f !== '33index.html'
  );

  // 3. Creamos la carpeta para los videos si no existe
  const outputDir = './videos';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  // 4. Configuramos el grabador
  const recorder = new PuppeteerScreenRecorder(page, { 
    fps: 25, 
    ffmpeg_Path: '/usr/bin/ffmpeg' 
  });

  console.log(`--- Iniciando grabación de ${files.length} proyectos ---`);

  for (const file of files) {
    const videoPath = path.join(outputDir, file.replace('.html', '.webm'));
    console.log(`Grabando: ${file}...`);
    
    try {
        // Cargamos el archivo localmente
        await page.goto('file://' + path.resolve(file), { waitUntil: 'networkidle0' });
        
        // Grabamos 4 segundos de "vida" del proyecto
        await recorder.start(videoPath);
        await new Promise(r => setTimeout(r, 4000)); 
        await recorder.stop();
        
        console.log(`✅ Guardado: ${videoPath}`);
    } catch (error) {
        console.error(`❌ Error en ${file}:`, error);
    }
  }

  await browser.close();
  console.log('--- ¡Proceso terminado! Tienes tus cinemagraphs en la carpeta /videos ---');
})();