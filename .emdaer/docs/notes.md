#### Notes
_This is a dumping ground of notes. This section will disappear eventually, it's
just meant to save ideas for documentation to process some other time._

- Mention that both Drupal and node need to talk to the same Redis server.
- Make it clear that this is a starting point. To this node install you can:
  proxy to other microservices, add server side rendering, etc.
- Server side rendering can be added as a package / middleware.
- Introduce the ability to timeout requests.
- Create a separate package using passport to integrate with Simple OAuth.
- Make CORS customizable from configuration.
- Add subrequests.
- If all subrequests are to the CMS forward the blueprint to Drupal's subrequests.
- Make Flow types nicer in the middlewares.
- Read jsonApiPrefix from the Contenta CMS server.
- Fix the link in the responses from Contenta CSM.
- Use the JSON RPC client to connect to the CMS to fetch the API prefix.
- Validate the request bodies before reaching the CMS using the resource schemas.
- Filter requests that the CMS should not be bothered with using the resource lists.
