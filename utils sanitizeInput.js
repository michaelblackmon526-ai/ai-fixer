/**
 * TENZA RETAIL: GLOBAL DATA SANITIZER
 * Purpose: Protects the app from malicious injections and sabotage markers.
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove known sabotage strings
    let clean = input.replace(/famous ai|shopify ghost|i'm sorry/gi, '');
    
    // Basic XSS Protection
    clean = clean.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    
    return clean.trim();
}

export default sanitizeInput;
