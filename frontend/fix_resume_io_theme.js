const fs = require('fs');
const path = require('path');

const sectionsDir = path.join(__dirname, 'components/resume-io/sections');
const files = fs.readdirSync(sectionsDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const filePath = path.join(sectionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace colors with CSS variables
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'var(--theme-input-bg)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'var(--theme-border)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.06\)/g, 'var(--theme-border)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.03\)/g, 'var(--theme-card)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.02\)/g, 'var(--theme-card)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.01\)/g, 'var(--theme-card)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.5\)/g, 'var(--theme-muted)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.4\)/g, 'var(--theme-muted)');
  content = content.replace(/#E8E6F0/gi, 'var(--theme-text)');
  content = content.replace(/#09090f/gi, 'var(--theme-bg)');
  
  // Also check EditorLayout and JDOptimizer, ATSChecker, ResumeUpload
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated sections/${file}`);
}

const extras = ['EditorLayout.js', 'JDOptimizer.js', 'ATSChecker.js', 'ResumeUpload.js', 'ExportPanel.js', 'TemplateGallery.js'];
for (const file of extras) {
  const filePath = path.join(__dirname, 'components/resume-io', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'var(--theme-input-bg)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'var(--theme-border)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.06\)/g, 'var(--theme-border)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.03\)/g, 'var(--theme-card)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.02\)/g, 'var(--theme-card)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.01\)/g, 'var(--theme-card)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.5\)/g, 'var(--theme-muted)');
    content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.4\)/g, 'var(--theme-muted)');
    content = content.replace(/#E8E6F0/gi, 'var(--theme-text)');
    content = content.replace(/#09090f/gi, 'var(--theme-bg)');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
