// 4. app/utils/yamlUtils.js - YAML Utilities
export function validateYaml(yamlString) {
  if (!yamlString.trim()) {
    return null;
  }

  try {
    const parsed = parseYaml(yamlString);
    return {
      valid: true,
      parsed: parsed,
      error: null
    };
  } catch (error) {
    return {
      valid: false,
      parsed: null,
      error: error.message
    };
  }
}

// Simple YAML parser (basic implementation)
function parseYaml(yamlString) {
  const lines = yamlString.split('\n');
  const result = {};
  const stack = [{ obj: result, indent: -1 }];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const indent = line.length - line.trimStart().length;
    
    // Pop stack until we find appropriate parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    let currentParent = stack[stack.length - 1].obj;

    if (trimmedLine.includes(':')) {
      const [key, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':').trim();
      const cleanKey = key.trim();

      if (value) {
        // Simple key-value pair
        if (value.startsWith('"') && value.endsWith('"')) {
          currentParent[cleanKey] = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          currentParent[cleanKey] = value.slice(1, -1);
        } else if (value === 'true' || value === 'false') {
          currentParent[cleanKey] = value === 'true';
        } else if (!isNaN(value) && !isNaN(parseFloat(value))) {
          currentParent[cleanKey] = parseFloat(value);
        } else {
          currentParent[cleanKey] = value;
        }
      } else {
        // Object or array
        currentParent[cleanKey] = {};
        stack.push({ obj: currentParent[cleanKey], indent: indent });
      }
    } else if (trimmedLine.startsWith('- ')) {
      // Array item
      const value = trimmedLine.substring(2).trim();
      if (!Array.isArray(currentParent)) {
        // Convert to array if not already
        const keys = Object.keys(currentParent);
        if (keys.length > 0) {
          const lastKey = keys[keys.length - 1];
          currentParent[lastKey] = [];
          currentParent = currentParent[lastKey];
        }
      }
      
      if (Array.isArray(currentParent)) {
        currentParent.push(value);
      }
    }
  }

  return result;
}