import os
import re

directories = [
    "src/app/dashboard/skills",
    "src/app/dashboard/suggestions",
    "src/app/dashboard/interview"
]

for dir_path in directories:
    file_path = os.path.join(dir_path, "page.tsx")
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # If it's already using useLatestAnalysis, skip
    if "useLatestAnalysis" in content:
        continue

    # Add import
    import_stmt = 'import { useLatestAnalysis } from "@/lib/useAnalysis";\n'
    if "import Link from" in content:
        content = content.replace('import Link from "next/link";', 'import Link from "next/link";\n' + import_stmt)
    elif "import { motion }" in content:
        content = content.replace('import { motion } from "framer-motion";', 'import { motion } from "framer-motion";\n' + import_stmt)
    else:
        content = import_stmt + content

    pattern1 = re.compile(r"const\s+\[hasData,\s*setHasData\]\s*=\s*useState\(false\);[\s\S]*?setIsLoading\(false\);\s*},\s*\[\]\);", re.MULTILINE)
    
    replacement1 = "const { data: latestData, loading: isLoading } = useLatestAnalysis();\n  const hasData = !!latestData;"
    
    content = pattern1.sub(replacement1, content)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {file_path}")
