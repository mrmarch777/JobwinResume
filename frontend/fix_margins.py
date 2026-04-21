import glob, re, os

for filepath in glob.glob('/Users/amarkhot/Desktop/resumeora/frontend/pages/*.js'):
    with open(filepath, 'r') as f:
        content = f.read()

    def replacer(match):
        attrs = match.group(1)
        if 'className="' in attrs:
            return f'<main {attrs.replace("className=\\"", "className=\\"mobile-main ")}>'
        else:
            return f'<main className="mobile-main" {attrs}>'

    # Match <main (...)> where (...) contains 'marginLeft'
    new_content = re.sub(r'<main ([^>]*marginLeft:[^>]*omp|[^>]*marginLeft[^>]*)>', replacer, content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {os.path.basename(filepath)}")

