import re

with open('pages/resume-io.js', 'r') as f:
    content = f.read()

replacement = """        @page {
          size: A4;
          margin: 15mm 18mm; /* Standard document margin — like Word */
        }
        body > div { min-height: 0 !important; }
        [data-page-spacer] { display: none !important; }
        * { box-sizing: border-box; }"""

content = re.sub(r'@page\s*\{\s*size:\s*A4;\s*margin:\s*15mm 18mm;\s*/\*\s*Standard document margin — like Word\s*\*/\s*\}\s*\*\s*\{\s*box-sizing:\s*border-box;\s*\}', replacement, content)

with open('pages/resume-io.js', 'w') as f:
    f.write(content)

