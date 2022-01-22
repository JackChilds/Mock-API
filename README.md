# Mock-API
Quickly create Mock API responses and deploy them to Vercel.

#### Why use Mock API?
- Use your Mock API from anywhere because it is hosted online
- Uses serverless technologies so it can be deployed to [Vercel for free](https://vercel.com/pricing)
- Easy to navigate UI
- Built in GitHub integration
- Extendable functionality through [processors](src/processors)

## Installation

1. Fork this repository to your own account
2. Deploy the forked project to [Vercel](https://vercel.com)
3. Navigate to the deployment URL in your browser
4. Follow the onscreen prompt to integrate with you GitHub account
5. Done!

By default, the configuration contains some example endpoints, you can view these by navigating to the dashboard and opening the server configuration or by referencing below.
- api/test:
  - Methods
    - GET
    - POST
    - PUT
    - DELETE
    - PATCH
   - Response
    - `{ "message": "It works!" }`
 - api/example/processor
  - GET
  - Uses the `example_processor.mjs` processor to produce a response
- api/example/processor2
  - GET
  - Requires a 'name' parameter to be sent
  - Uses the `example2.mjs` processor to produce a response 
- api/example/redirect
  - GET
  - Redirects you to a random image using [Lorem Picsum](https://picsum.photos/)

## Advanced Usage
**Custom Processors**: See the [custom processors guide](src/processors) README.
