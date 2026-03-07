#!/bin/bash
# Search for TODO comments in the Lucive codebase
# Usage: ./search_todos.sh [directory] [pattern]

DIR="${1:-.}"
PATTERN="${2:-(#|//|/\*|\*)\s*(TODO|FIXME|HACK|XXX)}"
EXCLUDE_DIRS="node_modules|\.git|__pycache__|\.expo|build|dist|package-lock\.json|search_todos\.sh"

echo "Searching for TODO comments in: $DIR"
echo "---"

results=$(grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
                   --include="*.py" --include="*.java" --include="*.kt" \
                   --include="*.sh" --include="*.md" \
                   -P "$PATTERN" "$DIR" 2>/dev/null \
  | grep -Ev "$EXCLUDE_DIRS" \
  | sort)

if [ -z "$results" ]; then
  echo "No TODO comments found."
else
  echo "$results"
fi

echo "---"
count=$(echo "$results" | grep -c . 2>/dev/null || echo 0)
[ -z "$results" ] && count=0
echo "Total: $count match(es) found"
