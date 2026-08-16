import os
import re

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

    # Replace useState and useEffect for data checking with hook
    # Many files have:
    # const [hasData, setHasData] = useState(false);
    # const [isLoading, setIsLoading] = useState(true);
    # useEffect(() => { ... sessionStorage.getItem("latestAnalysis") ... }, []);
    
    pattern1 = re.compile(r"const\s+\[hasData,\s*setHasData\]\s*=\s*useState\(false\);[\s\S]*?setIsLoading\(false\);\s*},\s*\[\]\);", re.MULTILINE)
    
    replacement1 = "const { data: latestData, loading: isLoading } = useLatestAnalysis();\n  const hasData = !!latestData;"
    
    content = pattern1.sub(replacement1, content)
    
    # Analyze and Dashboard main page might use `const [data, setData] = useState(...)`
    pattern2 = re.compile(r"const\s+\[data,\s*setData\]\s*=\s*useState<[^>]+>\(null\);[\s\S]*?setLoading\(false\);\s*},\s*\[\]\);", re.MULTILINE)
    replacement2 = "const { data, loading } = useLatestAnalysis();"
    content = pattern2.sub(replacement2, content)
    
    # Write back
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {file_path}")
