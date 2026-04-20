FILE: config.mjs
CONTENT:
```javascript
//+ START UPDATED
export const config = {
    backendPort: 5050,  // new backend port
    bridgePort: 7777,  // new bridge port
    ai: {
        defaultModel: "custom",  // default model set to custom
        temperature: 1.0,  // increased temperature
        maxTokens: 1024  // increased max tokens
    },
    logging: {
        enabled: false  // logging disabled
    }
};
//+ END UPDATED
```