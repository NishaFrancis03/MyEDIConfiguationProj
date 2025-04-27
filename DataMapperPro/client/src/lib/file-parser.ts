import { Field } from "@shared/schema";
import { isValidJSON } from "./utils";

export type SupportedFileTypes = 'JSON' | 'CSV' | 'XML' | 'SAP' | 'EXCEL';

// Function to parse a File object into Field[] structure
export async function parseFile(file: File, fileType: SupportedFileTypes): Promise<Field[]> {
  const fileContent = await readFileContent(file);
  
  switch (fileType) {
    case 'JSON':
      return parseJsonToFields(fileContent);
    case 'CSV':
      return parseCsvToFields(fileContent);
    case 'XML':
      return parseXmlToFields(fileContent);
    case 'SAP':
      return parseSapToFields(fileContent);
    case 'EXCEL':
      throw new Error('Excel parsing not implemented yet');
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function parseJsonToFields(content: string): Field[] {
  if (!isValidJSON(content)) {
    throw new Error('Invalid JSON content');
  }
  
  const parsed = JSON.parse(content);
  return buildFieldsFromJson(parsed, '');
}

function buildFieldsFromJson(data: any, parentPath: string, depth = 0): Field[] {
  if (depth > 10) return []; // Prevent infinite recursion
  
  if (data === null || data === undefined) {
    return [];
  }
  
  if (Array.isArray(data)) {
    // Take the first element as a sample if array is not empty
    if (data.length > 0) {
      const sampleObj = data[0];
      const childPath = parentPath ? `${parentPath}[0]` : '[0]';
      return buildFieldsFromJson(sampleObj, childPath, depth + 1);
    }
    return [];
  }
  
  if (typeof data === 'object') {
    const fields: Field[] = [];
    
    for (const key in data) {
      const value = data[key];
      const path = parentPath ? `${parentPath}.${key}` : key;
      const field: Field = { name: key, path };
      
      if (typeof value === 'object' && value !== null) {
        field.children = buildFieldsFromJson(value, path, depth + 1);
        field.type = Array.isArray(value) ? 'array' : 'object';
      } else {
        field.type = typeof value;
      }
      
      fields.push(field);
    }
    
    return fields;
  }
  
  // For primitive values
  return [{ name: parentPath, path: parentPath, type: typeof data }];
}

function parseCsvToFields(content: string): Field[] {
  const lines = content.split('\n');
  if (lines.length === 0) {
    return [];
  }
  
  // Assuming first line is header
  const header = lines[0].split(',').map(h => h.trim());
  
  return header.map(columnName => ({
    name: columnName,
    path: columnName,
    type: 'string'
  }));
}

function parseXmlToFields(content: string): Field[] {
  // This is a simplified XML parser - in a real application, 
  // you would use a proper XML parser library
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");
  
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error('Invalid XML content');
  }
  
  return extractXmlFields(xmlDoc.documentElement);
}

function extractXmlFields(element: Element, parentPath: string = ''): Field[] {
  const fields: Field[] = [];
  const nodeName = element.nodeName;
  const path = parentPath ? `${parentPath}.${nodeName}` : nodeName;
  
  // Add this element
  const field: Field = {
    name: nodeName,
    path,
    type: element.children.length > 0 ? 'object' : 'string',
    children: []
  };
  
  // Add attributes
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    field.children?.push({
      name: `@${attr.name}`,
      path: `${path}[@${attr.name}]`,
      type: 'string'
    });
  }
  
  // Add child elements
  for (let i = 0; i < element.children.length; i++) {
    const childFields = extractXmlFields(element.children[i], path);
    field.children?.push(...childFields);
  }
  
  fields.push(field);
  return fields;
}

function parseSapToFields(content: string): Field[] {
  // For SAP IDocs, we need a more specialized parser
  // This is a simplified example that assumes a specific format
  const lines = content.split('\n');
  const fields: Field[] = [];
  let currentSegment: Field | null = null;
  
  for (const line of lines) {
    if (line.startsWith('SEGMENT')) {
      // New segment
      const segmentName = line.split(' ')[1];
      currentSegment = {
        name: segmentName,
        path: segmentName,
        type: 'object',
        children: []
      };
      fields.push(currentSegment);
    } else if (currentSegment && line.trim() && !line.startsWith('//')) {
      // Field within segment
      const [name, type] = line.trim().split(':');
      currentSegment.children?.push({
        name: name.trim(),
        path: `${currentSegment.path}.${name.trim()}`,
        type: type?.trim() || 'string'
      });
    }
  }
  
  return fields;
}

// Builds JSON output based on mapping configuration
export function generateJsonOutput(
  sourceData: any, 
  fieldMappings: { sourceField: string; targetField: string; transformation: any }[]
): any {
  const result: any = {};
  
  fieldMappings.forEach(mapping => {
    const { sourceField, targetField, transformation } = mapping;
    
    // Get source value using path
    const sourceValue = getValueFromPath(sourceData, sourceField);
    
    // Apply transformation
    const transformedValue = applyTransformation(sourceValue, transformation);
    
    // Set in target using path
    setValueAtPath(result, targetField, transformedValue);
  });
  
  return result;
}

function getValueFromPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    // Handle array notation [index]
    const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const [_, name, index] = arrayMatch;
      current = current?.[name]?.[parseInt(index)];
    } else {
      current = current?.[part];
    }
    
    if (current === undefined) break;
  }
  
  return current;
}

function setValueAtPath(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    
    // Handle array notation [index]
    const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const [_, name, index] = arrayMatch;
      
      if (!current[name]) {
        current[name] = [];
      }
      
      const arrayIndex = parseInt(index);
      while (current[name].length <= arrayIndex) {
        current[name].push({});
      }
      
      current = current[name][arrayIndex];
    } else {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }
  
  const lastPart = parts[parts.length - 1];
  const arrayMatch = lastPart.match(/(\w+)\[(\d+)\]/);
  
  if (arrayMatch) {
    const [_, name, index] = arrayMatch;
    
    if (!current[name]) {
      current[name] = [];
    }
    
    const arrayIndex = parseInt(index);
    while (current[name].length <= arrayIndex) {
      current[name].push(null);
    }
    
    current[name][arrayIndex] = value;
  } else {
    current[lastPart] = value;
  }
}

function applyTransformation(value: any, transformation: any): any {
  switch (transformation.type) {
    case 'direct':
      return value;
      
    case 'lookup':
      if (transformation.config && typeof transformation.config === 'object') {
        return transformation.config[value] || value;
      }
      return value;
      
    case 'stringManipulation':
      if (typeof value === 'string') {
        // Example string manipulations
        if (transformation.config === 'uppercase') {
          return value.toUpperCase();
        } else if (transformation.config === 'lowercase') {
          return value.toLowerCase();
        } else if (transformation.config === 'trim') {
          return value.trim();
        }
      }
      return value;
      
    case 'numberFormat':
      if (typeof value === 'number' || !isNaN(Number(value))) {
        const num = Number(value);
        // Example number formatting
        if (transformation.config === 'integer') {
          return Math.floor(num);
        } else if (transformation.config === 'decimal2') {
          return num.toFixed(2);
        }
      }
      return value;
      
    case 'dateFormat':
      if (value) {
        try {
          const date = new Date(value);
          // Example date formatting
          if (transformation.config === 'ISO') {
            return date.toISOString();
          } else if (transformation.config === 'short') {
            return date.toLocaleDateString();
          }
        } catch (e) {
          return value;
        }
      }
      return value;
      
    case 'customScript':
      if (transformation.config && typeof transformation.config === 'string') {
        try {
          // WARNING: eval is dangerous in production, this is just for demonstration
          // A real implementation would use a safer approach
          const script = transformation.config;
          const source = value;
          // eslint-disable-next-line no-new-func
          return new Function('source', `"use strict"; ${script}`)(source);
        } catch (e) {
          console.error('Error in custom script transformation:', e);
          return value;
        }
      }
      return value;
      
    default:
      return value;
  }
}
