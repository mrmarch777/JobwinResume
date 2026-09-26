with open('/Users/amarkhot/Desktop/JobwinResume/frontend/components/resume-io/TemplateGallery.js', 'r') as f:
    content = f.read()

imports = """
import NeonTemplate from './templates/NeonTemplate';
import TimelineTemplate from './templates/TimelineTemplate';
import NavyTemplate from './templates/NavyTemplate';
import SunsetTemplate from './templates/SunsetTemplate';
import CompactTemplate from './templates/CompactTemplate';
import AcademicTemplate from './templates/AcademicTemplate';
"""

content = content.replace("import TwoColumnTemplate from './templates/TwoColumnTemplate';", "import TwoColumnTemplate from './templates/TwoColumnTemplate';" + imports)

entries = """
  { id: 'neon', name: 'Neon', category: 'Creative', desc: 'Dark theme with neon accents.', component: NeonTemplate, colors: ['#00FF88'] },
  { id: 'timeline', name: 'Timeline', category: 'Modern', desc: 'Left sidebar with timeline dots.', component: TimelineTemplate, colors: ['#3B82F6'] },
  { id: 'navy', name: 'Navy', category: 'Professional', desc: 'Navy blue header, professional look.', component: NavyTemplate, colors: ['#1E3A5F'] },
  { id: 'sunset', name: 'Sunset', category: 'Creative', desc: 'Warm gradient header.', component: SunsetTemplate, colors: ['#FF6B6B'] },
  { id: 'compact', name: 'Compact', category: 'ATS', ats: true, desc: 'Very dense 2-column layout.', component: CompactTemplate, colors: [] },
  { id: 'academic', name: 'Academic', category: 'Professional', desc: 'Traditional academic CV format.', component: AcademicTemplate, colors: [] },
"""

content = content.replace("{ id: 'two-column', name: 'Two Column', category: 'Modern', desc: 'Balanced two-column professional layout.', component: TwoColumnTemplate, colors: ['#6C63FF','#2c3e50','#0A4A6B','#7C3AED'] },", "{ id: 'two-column', name: 'Two Column', category: 'Modern', desc: 'Balanced two-column professional layout.', component: TwoColumnTemplate, colors: ['#6C63FF','#2c3e50','#0A4A6B','#7C3AED'] },\n" + entries)

with open('/Users/amarkhot/Desktop/JobwinResume/frontend/components/resume-io/TemplateGallery.js', 'w') as f:
    f.write(content)
