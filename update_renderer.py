with open('/Users/amarkhot/Desktop/JobwinResume/frontend/components/resume-io/templates/TemplateRenderer.js', 'r') as f:
    content = f.read()

imports = """
import NeonTemplate from './NeonTemplate';
import TimelineTemplate from './TimelineTemplate';
import NavyTemplate from './NavyTemplate';
import SunsetTemplate from './SunsetTemplate';
import CompactTemplate from './CompactTemplate';
import AcademicTemplate from './AcademicTemplate';
"""

content = content.replace("import TwoColumnTemplate from './TwoColumnTemplate';", "import TwoColumnTemplate from './TwoColumnTemplate';" + imports)

map_entries = """
  neon: NeonTemplate,
  timeline: TimelineTemplate,
  navy: NavyTemplate,
  sunset: SunsetTemplate,
  compact: CompactTemplate,
  academic: AcademicTemplate,
"""

content = content.replace("'two-column': TwoColumnTemplate,", "'two-column': TwoColumnTemplate," + map_entries)

with open('/Users/amarkhot/Desktop/JobwinResume/frontend/components/resume-io/templates/TemplateRenderer.js', 'w') as f:
    f.write(content)
