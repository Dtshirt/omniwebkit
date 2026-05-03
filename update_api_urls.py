import os
import re

tools_dir = r"c:\react projects\webtools\frontend\app\tools"

# Matches: fetch(`${API_V1}/something/...`)
# We want to insert 'tools/' before 'something' if 'something' is not 'tools', 'jobs', 'download', 'cleanup' (if cleanup is global, wait, cleanup is not global, it's under the tool)

pattern = re.compile(r'(\$\{API_V1\}/)(?!tools/|jobs/|download/|cleanup/)([\w\-]+)')

changed_files = 0

for root, dirs, files in os.walk(tools_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = pattern.sub(r'\1tools/\2', content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {filepath}")
                changed_files += 1

print(f"Total files updated: {changed_files}")
