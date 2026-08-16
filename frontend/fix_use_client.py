import os

directories = [
    "src/app/dashboard",
    "src/app/dashboard/job-match",
    "src/app/dashboard/reports",
    "src/app/dashboard/rewrite",
    "src/app/dashboard/skills",
    "src/app/dashboard/suggestions",
    "src/app/dashboard/interview"
]

for dir_path in directories:
    file_path = os.path.join(dir_path, "page.tsx")
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    has_use_client = any('use client' in line for line in lines)
    if has_use_client:
        # filter out use client lines
        new_lines = [line for line in lines if '"use client"' not in line and "'use client'" not in line]
        new_lines.insert(0, '"use client";\n')
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
            
    print(f"Checked {file_path}")
