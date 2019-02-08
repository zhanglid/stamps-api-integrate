1. credentail for the project

```XML
<tns:IntegrationID>142dc0eb-47cc-4b1a-82f0-73cecef49c</tns:IntegrationID>
<tns:Username>Lettopia-001</tns:Username>
<tns:Password>postage1</tns:Password>
```
```Json
{
    "Credentials": {
      "IntegrationID": "142dc0eb-47cc-4b1a-82f0-73cecef49cdc",
      "Username": "Lettopia-001",
      "Password": "postage1"
    }
}
```

2. Client
```JavaScript
const soap = require('soap')
soap.createClient(args, (err, client) => client)
```
   